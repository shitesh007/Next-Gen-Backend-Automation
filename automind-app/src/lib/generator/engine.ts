// Engine ported from legacy backend/generatorEngine.js
import fs from 'fs/promises';
import path from 'path';

export function pluralize(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith('ss') || lower.endsWith('x') || lower.endsWith('ch') || lower.endsWith('sh')) return lower + 'es';
  if (lower.endsWith('s')) return lower + 'es';
  if (lower.endsWith('y') && !'aeiou'.includes(lower[lower.length - 2])) return lower.slice(0, -1) + 'ies';
  return lower + 's';
}

function normalizeFields(fields: any[]) {
  if (Array.isArray(fields)) return fields;
  return Object.entries(fields).map(([name, type]) => ({ name, type, required: true }));
}

export async function generateProject(schema: any) {
  const { projectName, models } = schema;
  
  // For Vercel Serverless, we cannot write to disk (read-only file system except /tmp).
  // Therefore, we return the generated files as an in-memory object map instead of writing to disk.
  // This is required for Next.js App Router on Vercel.
  
  const files: Record<string, string> = {};

  let userModel = models.find((m: any) => m.name.toLowerCase() === 'user');
  const entityModels = models.filter((m: any) => m.name.toLowerCase() !== 'user');

  if (!userModel) {
    userModel = {
      name: 'User',
      fields: [
        { name: 'username', type: 'String', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'password', type: 'String', required: true },
        { name: 'role', type: 'String', required: false },
      ],
    };
  }

  // Generate package.json
  files['package.json'] = JSON.stringify({
    name: `${projectName.toLowerCase()}-api`,
    version: '1.0.0',
    type: 'module',
    scripts: { start: 'node server.js' }
  }, null, 2);

  // Generate server.js
  const routeImports = entityModels.map((m: any) => `import ${m.name.toLowerCase()}Routes from './routes/${pluralize(m.name)}.js';`).join('\n');
  const routeMounts = entityModels.map((m: any) => `app.use('/api/${pluralize(m.name)}', ${m.name.toLowerCase()}Routes);`).join('\n');
  
  files['server.js'] = `import express from 'express';\nimport cors from 'cors';\nimport dotenv from 'dotenv';\n\n${routeImports}\n\ndotenv.config();\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\n${routeMounts}\n\napp.listen(5000, () => console.log('Server running on port 5000'));\n`;

  // Generate models and routes
  for (const model of entityModels) {
    const fields = normalizeFields(model.fields).map(f => `  ${f.name}: { type: ${f.type}, required: ${f.required !== false} }`).join(',\\n');
    files[`models/${model.name.toLowerCase()}Model.js`] = `import mongoose from 'mongoose';\n\nconst schema = new mongoose.Schema({\n${fields}\n});\nexport default mongoose.model('${model.name}', schema);\n`;
    files[`routes/${pluralize(model.name)}.js`] = `import express from 'express';\nconst router = express.Router();\n// Generated CRUD routes here\nexport default router;\n`;
  }

  return files;
}
