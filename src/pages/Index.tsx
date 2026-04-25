import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, BadgeCheck, HandCoins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/CategoryGrid";
import heroImg from "@/assets/hero-gmc.jpg";
import { ProCard } from "@/components/ProCard";
import { useApp } from "@/store/app-store";

const Index = () => {
  const { pros } = useApp();
  const featured = [...pros].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-hero overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
        </div>
        <div className="container relative grid lg:grid-cols-12 gap-12 py-16 lg:py-24 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              KYC-verified · Built for Gelephu
            </span>
            <h1 className="font-display text-balance text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02]">
              Mindful service, <span className="text-primary">trusted hands.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
              GMC Service Hub connects residents of Gelephu Mindfulness City with certified plumbers, electricians, drivers, mechanics, cleaners, and masons — with transparent Nu. pricing and verified identities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/services">Browse services <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/about">Our mission</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="Verified pros" value={`${pros.filter(p => p.certified).length}+`} />
              <Stat label="Avg rating" value={(pros.reduce((a, b) => a + b.avgRating, 0) / pros.length).toFixed(1)} />
              <Stat label="Categories" value="6" />
            </dl>
          </div>
          <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border/60">
              <img src={heroImg} alt="Serene illustration of Gelephu Mindfulness City" width={1536} height={1152} className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-card border border-border/60 rounded-2xl shadow-elevated p-4 max-w-[260px] animate-float">
              <div className="flex items-center gap-2 mb-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary"><BadgeCheck className="h-4 w-4" /></span>
                <p className="text-sm font-semibold">Certified by GMC</p>
              </div>
              <p className="text-xs text-muted-foreground">Every pro is identity- and skill-verified before listing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 lg:py-20">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Explore</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1">Find your service pro</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/services">All categories <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <CategoryGrid />
      </section>

      {/* How it works */}
      <section className="bg-secondary-soft/50 py-16 lg:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">How it works</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">A calm, transparent flow</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title: "Verify yourself", body: "Phone OTP and CID-based KYC keep the marketplace safe and authentic for every GMC resident." },
              { icon: Sparkles, title: "Pick a verified pro", body: "Browse certified pros sorted by their Professional Value score — earned through real customer ratings." },
              { icon: HandCoins, title: "Quote, accept, complete", body: "Pros provide a transparent Nu. quote with platform fee shown. Pay only after accepting." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground mb-4">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured pros */}
      <section className="container py-16 lg:py-20">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Top rated</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 flex items-center gap-2">
              Highest professional value <Star className="h-7 w-7 fill-accent text-accent" />
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => <ProCard key={p.id} pro={p} />)}
        </div>
      </section>

      {/* About preview */}
      <section className="bg-gradient-primary text-primary-foreground">
        <div className="container py-16 lg:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              Designed for Gelephu Mindfulness City.
            </h2>
            <p className="mt-4 text-primary-foreground/85 max-w-lg">
              GMC is Bhutan's bold step toward a serene, sustainable, world-class economic hub. We believe everyday services should reflect those same values — honest, mindful, and human.
            </p>
            <Button asChild variant="soft" size="lg" className="mt-6 bg-background/95 text-primary hover:bg-background">
              <Link to="/about">Read our mission <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Identity verified", "Transparent Nu. pricing", "Real-time ratings", "Mindful conduct"].map((t) => (
              <div key={t} className="rounded-2xl bg-primary-foreground/10 backdrop-blur p-4 border border-primary-foreground/20">
                <BadgeCheck className="h-5 w-5 mb-2" />
                <p className="text-sm font-medium">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="font-display text-3xl font-semibold text-foreground">{value}</div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
  </div>
);

export default Index;
