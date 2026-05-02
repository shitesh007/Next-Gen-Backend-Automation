import { NextResponse } from 'next/server';
import { GenerateRequestSchema } from '@/lib/validators/schemas';
import { generateProject } from '@/lib/generator/engine';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

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


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = GenerateRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request format", details: result.error }, { status: 400 });
    }

    const { prompt } = result.data;

    let schemaStr = "";
    
    if (process.env.GEMINI_API_KEY) {
      const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash-lite",
        maxOutputTokens: 2048,
        apiKey: process.env.GEMINI_API_KEY,
      });
      const aiResponse = await model.invoke(SYSTEM_PROMPT + "\\n\\nUser prompt: " + prompt);
      schemaStr = aiResponse.content.toString();
    } else {
      // Fallback dummy schema if no key provided
      schemaStr = JSON.stringify({
        projectName: "DemoApp",
        models: [{ name: "User", fields: [{ name: "email", type: "String" }] }]
      });
    }

    // Clean JSON markdown
    schemaStr = schemaStr.replace(/\`\`\`json\\n?/g, '').replace(/\`\`\`\\n?/g, '').trim();
    
    const schemaObj = JSON.parse(schemaStr);
    
    // In-memory code generation (Vercel Serverless Compatible)
    const files = await generateProject(schemaObj);

    return NextResponse.json({ 
      success: true, 
      schema: schemaObj, 
      files 
    });
    
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
