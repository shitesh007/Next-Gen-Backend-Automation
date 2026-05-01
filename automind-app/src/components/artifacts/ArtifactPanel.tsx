"use client";

import { useState } from "react";
import { CodeViewer } from "./CodeViewer";

export function ArtifactPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'code' | 'swagger' | 'playground'>('code');

  return (
    <div className="h-full flex flex-col bg-card border-l border-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">📦</span>
          <span className="font-semibold text-sm">E-commerce API</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors">
            ⬇️ Download ZIP
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-1 border-b border-border bg-background/30">
        {[
          { id: 'code', label: '💻 Code' },
          { id: 'swagger', label: '📖 Swagger UI' },
          { id: 'playground', label: '🧪 Playground' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id 
                ? 'bg-secondary text-secondary-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'swagger' && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Swagger UI Integration (Coming Soon)
          </div>
        )}
        {activeTab === 'playground' && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
            <span className="text-2xl">🔒</span>
            <p>Secure Firecracker Micro-VM testing environment</p>
          </div>
        )}
      </div>
    </div>
  );
}
