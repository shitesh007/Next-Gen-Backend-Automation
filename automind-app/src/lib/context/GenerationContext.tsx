"use client";

import React, { createContext, useContext, useState } from 'react';

interface GeneratedFile {
  name: string;
  content: string;
}

interface GenerationContextType {
  projectName: string;
  files: GeneratedFile[];
  setGeneratedData: (name: string, filesMap: Record<string, string>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [projectName, setProjectName] = useState("MyAPI");
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const setGeneratedData = (name: string, filesMap: Record<string, string>) => {
    setProjectName(name);
    const fileList = Object.entries(filesMap).map(([name, content]) => ({ name, content }));
    setFiles(fileList);
  };

  return (
    <GenerationContext.Provider value={{ projectName, files, setGeneratedData, isLoading, setIsLoading }}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
