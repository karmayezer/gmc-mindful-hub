import { Star, ShieldCheck, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { type Pro, formatNu } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProCardProps {
  pro: Pro;
}

export const ProCard = ({ pro }: ProCardProps) => {
  return (
    <article className="group bg-gradient-card border border-border/60 rounded-2xl p-5 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-smooth flex flex-col">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div
            className="h-14 w-14 rounded-2xl bg-gradient-mint grid place-items-center text-secondary-foreground font-display text-xl font-semibold shrink-0"
            aria-hidden
          >
            {pro.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          {pro.certified && (
            <span className="absolute -bottom-1 -right-1 grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-soft" title="Certified by GMC">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight truncate">{pro.name}</h3>
            <RatingPill rating={pro.avgRating} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{pro.bio}</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 mt-5 text-center">
        <div className="rounded-xl bg-muted/60 py-2.5">
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Base rate</dt>
          <dd className="text-sm font-semibold mt-0.5">{formatNu(pro.baseRateNu)}</dd>
        </div>
        <div className="rounded-xl bg-muted/60 py-2.5">
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Jobs</dt>
          <dd className="text-sm font-semibold mt-0.5">{pro.totalJobs}</dd>
        </div>
        <div className="rounded-xl bg-muted/60 py-2.5">
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Years</dt>
          <dd className="text-sm font-semibold mt-0.5">{pro.yearsExperience}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between mt-5 gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            pro.certified
              ? "bg-primary-soft text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Award className="h-3.5 w-3.5" />
          {pro.certified ? "Certified" : "In review"}
        </span>
        <Button asChild size="sm" variant="hero" className="rounded-full">
          <Link to={`/pro/${pro.id}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
};

export const RatingPill = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold",
      size === "sm"
        ? "text-xs px-2 py-0.5 bg-accent/15 text-accent-foreground"
        : "text-sm px-2.5 py-1 bg-accent/20 text-accent-foreground",
    )}
  >
    <Star className={cn("fill-accent text-accent", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
    {rating.toFixed(1)}
  </span>
);
