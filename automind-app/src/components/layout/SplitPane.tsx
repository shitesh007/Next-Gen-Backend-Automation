"use client";

import { useState } from "react";
import { ArtifactPanel } from "@/components/artifacts/ArtifactPanel";

export function SplitPane({ children }: { children: React.ReactNode }) {
  // For demo purposes, we will control the artifact panel visibility.
  // In a real app, this would be derived from global state (e.g., Zustand or Context)
  const [showArtifacts, setShowArtifacts] = useState(true);

  return (
    <div className="flex w-full h-full">
      {/* Left Pane - Chat Interface */}
      <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${showArtifacts ? "w-1/2 border-r border-border" : "w-full"}`}>
        {children}
      </div>

      {/* Right Pane - Artifacts (Code/Swagger) */}
      {showArtifacts && (
        <div className="w-1/2 h-full flex flex-col bg-card/30 animate-in slide-in-from-right-10 duration-300">
          <ArtifactPanel onClose={() => setShowArtifacts(false)} />
        </div>
      )}
    </div>
  );
}
