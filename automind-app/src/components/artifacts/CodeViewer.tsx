"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useGeneration } from "@/lib/context/GenerationContext";

export function CodeViewer() {
  const { files, isLoading } = useGeneration();
  const [activeFile, setActiveFile] = useState<{name: string, content: string} | null>(null);

  // Set first file as active when files are loaded
  useEffect(() => {
    if (files.length > 0) {
      setActiveFile(files[0]);
    } else {
      setActiveFile(null);
    }
  }, [files]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-muted-foreground animate-pulse">
        <p>Architecting your backend code...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-muted-foreground">
        <p>No files generated yet. Start a chat to build your API!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File Explorer horizontal bar */}
      <div className="flex overflow-x-auto border-b border-border bg-background/50 p-2 gap-2">
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => setActiveFile(f)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-colors ${
              activeFile?.name === f.name
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
        {activeFile && (
          <SyntaxHighlighter 
            language={activeFile.name.endsWith('.json') ? 'json' : 'javascript'} 
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', height: '100%' }}
            showLineNumbers={true}
          >
            {activeFile.content}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}

