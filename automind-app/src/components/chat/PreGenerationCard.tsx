export function PreGenerationCard({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="w-full max-w-lg bg-card border border-primary/30 rounded-xl overflow-hidden shadow-lg shadow-primary/5">
      <div className="bg-primary/10 px-5 py-3 border-b border-primary/20 flex items-center justify-between">
        <span className="font-semibold text-sm text-primary">Pre-Generation Analysis</span>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md font-mono">Status: Ready</span>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-1">DB Tables</div>
            <div className="font-mono text-sm font-bold">5 Entities</div>
            <div className="text-xs text-muted-foreground mt-1 truncate">Users, Products, Orders...</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-1">API Endpoints</div>
            <div className="font-mono text-sm font-bold">~25 Routes</div>
            <div className="text-xs text-muted-foreground mt-1 truncate">Full CRUD + Auth</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-muted-foreground">Stack:</span>
            <span className="font-medium">Node.js, Express, Mongoose</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-muted-foreground">Auth:</span>
            <span className="font-medium">JWT & bcrypt</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Looks good, generate code
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            Edit schema
          </button>
        </div>
      </div>
    </div>
  );
}
