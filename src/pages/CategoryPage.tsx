import { Link, useParams } from "react-router-dom";
import { useApp } from "@/store/app-store";
import { getCategory } from "@/data/marketplace";
import { ProCard } from "@/components/ProCard";
import { ArrowLeft, ArrowDownWideNarrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { pros } = useApp();
  const category = categoryId ? getCategory(categoryId) : undefined;
  const [filter, setFilter] = useState<"all" | "certified">("all");

  const list = useMemo(() => {
    if (!category) return [];
    // Hide pros that haven't been approved by admin from the public directory.
    const base = pros.filter((p) => p.category === category.id && p.isApproved !== false);
    const filtered = filter === "certified" ? base.filter((p) => p.certified) : base;
    return [...filtered].sort((a, b) => b.avgRating - a.avgRating);
  }, [pros, category, filter]);

  if (!category) {
    return (
      <section className="container py-20 text-center">
        <h1 className="font-display text-3xl">Category not found</h1>
        <Button asChild variant="hero" className="mt-6"><Link to="/services">Back to services</Link></Button>
      </section>
    );
  }

  const Icon = category.icon;

  return (
    <section className="container py-12 lg:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/services"><ArrowLeft className="mr-1 h-4 w-4" /> All categories</Link>
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">{category.tagline} · Platform fee: {category.commissionPct}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sorted by rating</span>
          <Button size="sm" variant={filter === "all" ? "hero" : "outline"} onClick={() => setFilter("all")} className="rounded-full">All</Button>
          <Button size="sm" variant={filter === "certified" ? "hero" : "outline"} onClick={() => setFilter("certified")} className="rounded-full">Certified</Button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground">No pros match these filters yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((pro) => <ProCard key={pro.id} pro={pro} />)}
        </div>
      )}
    </section>
  );
};

export default CategoryPage;
