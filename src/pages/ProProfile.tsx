import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/store/app-store";
import { formatNu, getCategory, maskAddress, maskPhone } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck, Star, MapPin, Phone, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ProProfile = () => {
  const { proId } = useParams<{ proId: string }>();
  const { pros, user, createJob, jobs } = useApp();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  const pro = pros.find((p) => p.id === proId);
  if (!pro) {
    return (
      <section className="container py-20 text-center">
        <h1 className="font-display text-3xl">Pro not found</h1>
        <Button asChild variant="hero" className="mt-6"><Link to="/services">Back to services</Link></Button>
      </section>
    );
  }
  // Hide unapproved pros from the public — direct-URL access is also blocked.
  if (pro.isApproved === false) {
    return (
      <section className="container py-20 text-center">
        <h1 className="font-display text-3xl">Profile pending verification</h1>
        <p className="text-muted-foreground mt-2">This professional is awaiting GMC admin approval and isn't publicly listed yet.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/services">Back to services</Link></Button>
      </section>
    );
  }
  const category = getCategory(pro.category);
  const flagged = pro.avgRating < 3.0;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast("Please sign in to contact a pro.");
      const fn = (window as unknown as { __requireAuth?: (p: string) => void }).__requireAuth;
      fn?.(`/pro/${pro.id}`);
      return;
    }
    if (description.trim().length < 8) {
      toast.error("Please describe the job (at least a sentence).");
      return;
    }
    const job = createJob({ proId: pro.id, description: description.trim() });
    if (job) {
      toast.success("Request sent. The pro will provide a quote.");
      navigate("/jobs");
    }
  };

  // Show recent customer reviews from rated jobs against this pro.
  const reviews = jobs
    .filter((j) => j.proId === pro.id && typeof j.rating === "number")
    .slice(0, 4);

  return (
    <section className="container py-12 lg:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to={`/services/${pro.category}`}><ArrowLeft className="mr-1 h-4 w-4" /> Back to {category?.name}</Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-6 lg:p-8 shadow-soft">
            <div className="flex flex-wrap items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-mint grid place-items-center font-display text-3xl font-semibold text-secondary-foreground shrink-0">
                {pro.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-3xl md:text-4xl font-semibold">{pro.name}</h1>
                  {pro.certified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" /> Certified
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{category?.name} · {pro.yearsExperience} yrs · {pro.totalJobs} jobs</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent-foreground text-sm font-semibold">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {pro.avgRating.toFixed(2)} <span className="text-muted-foreground font-normal">/5</span>
                  </div>
                  {flagged && (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Flagged for review
                    </span>
                  )}
                </div>
                <p className="mt-4 text-foreground/90 max-w-xl">{pro.bio}</p>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              <Stat label="Market base rate" value={formatNu(pro.baseRateNu)} accent />
              <Stat label="Platform fee" value={`${category?.commissionPct ?? 12}%`} />
              <Stat label="Service area" value={pro.generalArea} />
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Recent reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-3">No reviews yet — be the first to rate {pro.name.split(" ")[0]}.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl bg-secondary-soft/40 p-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{r.rating?.toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">· {r.customerName}</span>
                    </div>
                    {r.ratingComment && <p className="text-sm text-muted-foreground mt-1">"{r.ratingComment}"</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column: contact card + start request */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sticky top-24">
            <h2 className="font-display text-lg font-semibold mb-3">Contact details</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Phone & precise address are unlocked once the pro's quote is accepted.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {maskPhone(pro.phone)}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {maskAddress(pro.preciseAddress, pro.generalArea)}</p>
            </div>

            <form onSubmit={handleStart} className="mt-5 space-y-3">
              <Label htmlFor="desc">Describe the job</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`E.g. ${category?.name} work needed at my GMC residence — ...`}
                rows={4}
                className="rounded-xl"
              />
              <Button type="submit" variant="hero" size="lg" className="w-full">Request a quote</Button>
              {!user && <p className="text-xs text-muted-foreground text-center">You'll be asked to sign in.</p>}
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
};

const Stat = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <div className={`rounded-xl px-4 py-3 ${accent ? "bg-primary-soft" : "bg-muted/60"}`}>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold mt-0.5 ${accent ? "text-primary" : ""}`}>{value}</p>
  </div>
);

export default ProProfile;
