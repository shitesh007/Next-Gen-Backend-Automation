"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MOCK_FILES = [
  { name: 'server.js', content: `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.listen(5000, () => {\n  console.log('Server running on port 5000');\n});` },
  { name: 'models/user.js', content: `import mongoose from 'mongoose';\n\nconst userSchema = new mongoose.Schema({\n  email: { type: String, required: true },\n  password: { type: String, required: true }\n});\n\nexport default mongoose.model('User', userSchema);` }
];

export function CodeViewer() {
  const [activeFile, setActiveFile] = useState(MOCK_FILES[0]);

  return (
    <div className="h-full flex flex-col">
      {/* File Explorer horizontal bar */}
      <div className="flex overflow-x-auto border-b border-border bg-background/50 p-2 gap-2">
        {MOCK_FILES.map(f => (
          <button
            key={f.name}
            onClick={() => setActiveFile(f)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-colors ${
              activeFile.name === f.name
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:bg-secondary border border-transparent'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      
      {/* Code Editor Area */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e] text-sm">
        <SyntaxHighlighter 
          language="javascript" 
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent', height: '100%' }}
          showLineNumbers={true}
        >
          {activeFile.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
