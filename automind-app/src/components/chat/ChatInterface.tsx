"use client";

import { useState } from "react";
import { TemplateCards } from "./TemplateCards";
import { PreGenerationCard } from "./PreGenerationCard";
import { useGeneration } from "@/lib/context/GenerationContext";

export function ChatInterface() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string, type?: 'text' | 'pre-gen'}[]>([]);
  const [input, setInput] = useState("");
  const { setGeneratedData, setIsLoading, isLoading } = useGeneration();

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      // Step 1: Just show a confirmation card for now (simulating pre-gen analysis)
      // In a more advanced flow, we would call an AI endpoint here to get the schema first.
      // For this task, we'll directly trigger the generation on confirm.
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: "I've analyzed your request. Here's the proposed architecture for your backend." 
          },
          {
            role: 'assistant',
            content: text, // Pass the original prompt to the card
            type: 'pre-gen'
          }
        ]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error("Chat Error:", error);
      setIsLoading(false);
    }
  };

  const handleConfirmGeneration = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedData(data.schema.projectName, data.files);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ Successfully generated **${data.schema.projectName}** with ${Object.keys(data.files).length} files. Check the Artifact Panel on the right!` 
        }]);
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <TemplateCards onSelect={handleSend} />
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  AI
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-muted/50 border border-border rounded-tl-sm'
              }`}>
                {msg.type === 'pre-gen' ? (
                  <PreGenerationCard onConfirm={() => handleConfirmGeneration(msg.content)} />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                  U
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/10" />
            <div className="h-10 w-48 bg-muted/30 rounded-2xl" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Describe the backend you want to build..."
            className="w-full min-h-[60px] max-h-[200px] bg-card border border-border rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm disabled:opacity-50"
            rows={1}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            )}
          </button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          AutoMind AI can make mistakes. Please verify the generated code.
        </p>
      </div>
    </div>
  );
}

