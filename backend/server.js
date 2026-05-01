import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { streamProjectZip } from './services/zipService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// SYSTEM PROMPT for Gemini AI
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
// POST /api/generate-schema
// ============================================
app.post('/api/generate-schema', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    let schema;

    if (process.env.GEMINI_API_KEY) {
      // Live Gemini AI call
      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
        console.error('Gemini API error:', aiData.error.message);
        schema = parsePromptToSchema(prompt);
      } else {
        const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          schema = JSON.parse(cleaned);
        } catch {
          console.error('Gemini returned unparseable JSON, using fallback. Raw:', cleaned.substring(0, 200));
          schema = parsePromptToSchema(prompt);
        }
      }
    } else {
      schema = parsePromptToSchema(prompt);
    }

    return res.json({ schema });
  } catch (err) {
    console.error('Schema generation error:', err.message);
    return res.status(500).json({ message: 'Failed to generate schema: ' + err.message });
  }
});

// ============================================
// POST /api/build
// ============================================
app.post('/api/build', async (req, res) => {
  const { schema } = req.body;
  if (!schema || !schema.projectName) return res.status(400).json({ message: 'Valid schema is required' });

  try {
    await fs.writeFile(path.join(__dirname, 'input.json'), JSON.stringify(schema, null, 2));
    const { generateProject } = await import('./generatorEngine.js?t=' + Date.now());
    const files = await generateProject(schema);
    return res.json({ files, projectName: schema.projectName, message: 'API generated successfully!' });
  } catch (err) {
    console.error('Build error:', err.message);
    return res.status(500).json({ message: 'Build failed: ' + err.message });
  }
});

// ============================================
// GET /api/download/:projectName
// ============================================
app.get('/api/download/:projectName', (req, res) => {
  try {
    streamProjectZip(req.params.projectName, res);
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(404).json({ message: err.message });
  }
});

// ============================================
// Fallback Prompt Parser
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
      { name: 'author', type: 'String', required: true },
      { name: 'published', type: 'Boolean', required: false },
    ],
    product: [
      { name: 'name', type: 'String', required: true },
      { name: 'price', type: 'Number', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'category', type: 'String', required: true },
      { name: 'inStock', type: 'Boolean', required: false },
    ],
    order: [
      { name: 'orderNumber', type: 'String', required: true },
      { name: 'totalAmount', type: 'Number', required: true },
      { name: 'status', type: 'String', required: true },
      { name: 'customer', type: 'String', required: true },
    ],
    task: [
      { name: 'title', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'status', type: 'String', required: true },
      { name: 'priority', type: 'String', required: true },
      { name: 'dueDate', type: 'Date', required: false },
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

  return { projectName, models };
}

// ============================================
// START
// ============================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🟢 AutoMind API Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'ACTIVE' : 'FALLBACK MODE'}`);
});
