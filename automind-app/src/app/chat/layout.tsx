import { SplitPane } from "@/components/layout/SplitPane";
import { GenerationProvider } from "@/lib/context/GenerationContext";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GenerationProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar - Fixed Width */}
        <aside className="w-[260px] flex-shrink-0 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-white">
              ⚡
            </div>
            <span className="font-extrabold text-lg tracking-tight">Auto<span className="text-primary">Mind</span></span>
          </div>
          <div className="p-4">
            <button className="w-full flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <span className="text-lg">+</span> New Generation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            {/* Conversation History List will go here */}
          </div>
        </aside>

        {/* Main Content Area - Split Pane for Chat and Artifacts */}
        <main className="flex-1 flex overflow-hidden">
          <SplitPane>
            {children}
          </SplitPane>
        </main>
      </div>
    </GenerationProvider>
  );
}

