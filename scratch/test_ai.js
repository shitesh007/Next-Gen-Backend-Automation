import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

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

async function testAI() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    return;
  }

  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = "Build a Task Management API where users can create tasks and see only their own tasks.";
  
  console.log("Calling Gemini with prompt:", prompt);
  const response = await model.invoke(SYSTEM_PROMPT + "\n\nUser prompt: " + prompt);
  console.log("AI Response:");
  console.log(response.content);
}

testAI();
