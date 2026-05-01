/**
 * AutoMind — WebSocket Message Handler (Core)
 *
 * Triggered by the `sendMessage` route on the WebSocket API.
 *
 * Flow:
 *  1. Receive the user's plain English prompt from the WebSocket payload.
 *  2. Send a "processing" acknowledgement back to the client.
 *  3. Call the Gemini AI to convert the prompt into a structured JSON schema.
 *  4. Send the generated schema/API code back to the user's connectionId
 *     via the API Gateway Management API.
 */

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

const TABLE_NAME = process.env.TABLE_NAME;
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ============================================
// AI System Prompt (matches server.js logic)
// ============================================
const SYSTEM_PROMPT = `You are a specialized Backend Architect AI. Your ONLY job is to convert user requirements into a structured JSON schema for a Node.js/Express/Mongoose generator.

Strict Rules:
1. Output ONLY valid JSON. No conversational text, no markdown code blocks, and no explanations.
2. You must follow the exact schema structure provided below.
3. If a requirement is unclear, make a best-guess technical decision rather than asking questions.
4. ALWAYS include a "User" model with fields: username (String), email (String), password (String), role (String). This is mandatory for authentication.
5. For non-User models (e.g., Task, Post, Product), do NOT add a "user" or "author" or "owner" ownership field. The code generator will automatically inject a user ownership reference (ObjectId ref to User) into every non-User model.
6. Each non-User model should contain ONLY its own domain-specific fields.

Required JSON Format:
{
  "projectName": "string",
  "models": [
    {
      "name": "string (PascalCase, e.g., User, Task, Post)",
      "fields": [
        { "name": "string", "type": "String|Number|Boolean|Date", "required": true|false }
      ]
    }
  ]
}`;

// ============================================
// Fallback Prompt Parser (when AI unavailable)
// ============================================
function parsePromptToSchema(prompt) {
  const lower = prompt.toLowerCase();

  const namePatterns = [
    /(?:build|create|make|generate)\s+(?:a|an)?\s*(.+?)\s+(?:app|api|platform|system|with)/i,
    /(?:build|create|make|generate)\s+(?:a|an)?\s*(.+?)$/i,
  ];
  let projectName = 'MyApp';
  for (const pattern of namePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      projectName = match[1].trim().replace(/\s+/g, '').replace(/^(a|an)\s*/i, '');
      if (projectName.length > 20) projectName = projectName.substring(0, 20);
      break;
    }
  }

  const modelKeywords = {
    user: [
      { name: 'username', type: 'String', required: true },
      { name: 'email', type: 'String', required: true },
      { name: 'password', type: 'String', required: true },
      { name: 'role', type: 'String', required: false },
    ],
    post: [
      { name: 'title', type: 'String', required: true },
      { name: 'content', type: 'String', required: true },
      { name: 'published', type: 'Boolean', required: false },
    ],
    product: [
      { name: 'name', type: 'String', required: true },
      { name: 'price', type: 'Number', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'category', type: 'String', required: true },
      { name: 'inStock', type: 'Boolean', required: false },
    ],
    task: [
      { name: 'title', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'status', type: 'String', required: true },
      { name: 'priority', type: 'String', required: true },
      { name: 'dueDate', type: 'Date', required: false },
    ],
    order: [
      { name: 'orderNumber', type: 'String', required: true },
      { name: 'totalAmount', type: 'Number', required: true },
      { name: 'status', type: 'String', required: true },
    ],
    project: [
      { name: 'name', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'status', type: 'String', required: true },
      { name: 'deadline', type: 'Date', required: false },
    ],
    customer: [
      { name: 'name', type: 'String', required: true },
      { name: 'email', type: 'String', required: true },
      { name: 'phone', type: 'String', required: false },
      { name: 'address', type: 'String', required: false },
    ],
  };

  const models = [];
  for (const [keyword, fields] of Object.entries(modelKeywords)) {
    if (lower.includes(keyword)) {
      models.push({ name: keyword.charAt(0).toUpperCase() + keyword.slice(1), fields });
    }
  }
  if (models.length === 0) {
    models.push({ name: 'User', fields: modelKeywords.user });
  }
  // Ensure User model is always present
  if (!models.some(m => m.name === 'User')) {
    models.unshift({ name: 'User', fields: modelKeywords.user });
  }

  return { projectName, models };
}

// ============================================
// Main Handler
// ============================================
export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  // Build the API GW Management API client using the live endpoint
  const callbackUrl = WEBSOCKET_ENDPOINT || `https://${domain}/${stage}`;
  const apigw = new ApiGatewayManagementApiClient({
    endpoint: callbackUrl,
  });

  // Helper: send a JSON payload back to the connected client
  const sendToClient = async (payload) => {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await apigw.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: new TextEncoder().encode(data),
    }));
  };

  try {
    // Parse incoming message
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt || body.message || '';

    if (!prompt) {
      await sendToClient({ type: 'error', message: 'No prompt provided. Send { "action": "sendMessage", "prompt": "your idea" }' });
      return { statusCode: 400, body: 'No prompt.' };
    }

    console.log(`[MESSAGE] connectionId=${connectionId} prompt="${prompt.substring(0, 100)}..."`);

    // --- Step 1: Send "processing" acknowledgement ---
    await sendToClient({
      type: 'status',
      message: '🧠 Analyzing your prompt... Generating schema.',
      timestamp: new Date().toISOString(),
    });

    // --- Step 2: Generate schema via Gemini AI (with fallback) ---
    let schema;

    if (GEMINI_API_KEY) {
      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\nUser prompt: ' + prompt }] }],
              generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
            }),
          }
        );
        const aiData = await aiResponse.json();

        if (aiData.error) {
          console.error('[MESSAGE] Gemini API error:', aiData.error.message);
          schema = parsePromptToSchema(prompt);
        } else {
          const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            schema = JSON.parse(cleaned);
          } catch {
            console.error('[MESSAGE] Gemini returned unparseable JSON, using fallback.');
            schema = parsePromptToSchema(prompt);
          }
        }
      } catch (aiErr) {
        console.error('[MESSAGE] Gemini fetch failed:', aiErr.message);
        schema = parsePromptToSchema(prompt);
      }
    } else {
      schema = parsePromptToSchema(prompt);
    }

    // --- Step 3: Send generated schema back to the client ---
    await sendToClient({
      type: 'schema',
      message: '✅ Schema generated successfully!',
      schema: schema,
      timestamp: new Date().toISOString(),
    });

    // --- Step 4: Generate a summary of what was built ---
    const modelNames = schema.models?.map(m => m.name) || [];
    const entityModels = modelNames.filter(n => n !== 'User');

    const summary = {
      type: 'summary',
      projectName: schema.projectName,
      features: [
        `📦 ${modelNames.length} models: ${modelNames.join(', ')}`,
        `🔐 JWT Authentication (register + login)`,
        `🛡️ Role-Based Access Control`,
        `🔒 Bcrypt password hashing`,
        ...entityModels.map(name => `📝 Full CRUD for ${name} (scoped to user)`),
        `🌐 CORS + Helmet security`,
      ],
      endpoints: [
        { method: 'POST', path: '/api/auth/register', access: 'Public' },
        { method: 'POST', path: '/api/auth/login', access: 'Public' },
        ...entityModels.flatMap(name => [
          { method: 'GET',    path: `/api/${name.toLowerCase()}s`,     access: 'Private' },
          { method: 'GET',    path: `/api/${name.toLowerCase()}s/:id`, access: 'Private' },
          { method: 'POST',   path: `/api/${name.toLowerCase()}s`,     access: 'Private' },
          { method: 'PUT',    path: `/api/${name.toLowerCase()}s/:id`, access: 'Private' },
          { method: 'DELETE', path: `/api/${name.toLowerCase()}s/:id`, access: 'Private' },
        ]),
      ],
      message: '🚀 Your production-ready API blueprint is ready! Click "Build API" to generate the full codebase.',
      timestamp: new Date().toISOString(),
    };

    await sendToClient(summary);

    return { statusCode: 200, body: 'Message processed.' };

  } catch (err) {
    console.error('[MESSAGE] Handler error:', err);

    try {
      await sendToClient({
        type: 'error',
        message: `❌ Processing failed: ${err.message}`,
        timestamp: new Date().toISOString(),
      });
    } catch (sendErr) {
      console.error('[MESSAGE] Failed to send error to client:', sendErr.message);
    }

    return { statusCode: 500, body: 'Internal error.' };
  }
};
