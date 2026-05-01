"use cn";

export function TemplateCards({ onSelect }: { onSelect: (prompt: string) => void }) {
  const templates = [
    {
      title: "🛒 E-commerce Platform",
      description: "Products, Orders, Customers, Inventory, and Payments.",
      prompt: "Build an e-commerce platform with Products, Orders, Customers, and Payments."
    },
    {
      title: "🏫 School Management",
      description: "Students, Teachers, Classes, Grades, and Attendance.",
      prompt: "Create a school management system with Students, Teachers, Classes, and Grades."
    },
    {
      title: "🏢 SaaS Boilerplate",
      description: "Tenants, Subscriptions, Users, and Roles.",
      prompt: "Generate a multi-tenant SaaS boilerplate with Organizations, Users, and Subscriptions."
    },
    {
      title: "📋 Task Manager",
      description: "Projects, Tasks, Teams, and Sprints.",
      prompt: "Make a task manager with Projects, Tasks, Teams, and Sprints."
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">What API do you want to build?</h2>
        <p className="text-muted-foreground text-lg">Start with a template or describe your requirements.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <button
            key={t.title}
            onClick={() => onSelect(t.prompt)}
            className="text-left p-5 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
          >
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{t.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
