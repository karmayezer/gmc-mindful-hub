import { CATEGORIES } from "@/data/marketplace";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {CATEGORIES.map((cat, idx) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.id}
            to={`/services/${cat.id}`}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 md:p-6 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-smooth"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-secondary-soft opacity-60 group-hover:scale-110 transition-smooth" />
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary mb-4">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-xl font-semibold">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{cat.tagline}</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Browse pros
                <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
