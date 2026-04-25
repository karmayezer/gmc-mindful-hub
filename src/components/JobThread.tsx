import { useMemo, useState } from "react";
import { useApp, type Job } from "@/store/app-store";
import { formatNu, getCategory, maskAddress, maskPhone, type Pro } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MessageCircle, Phone, MapPin, Send, Star, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface JobThreadProps {
  job: Job;
  pro: Pro;
  /** "customer" view shows accept/rate flows; "pro" view shows quote form. */
  perspective?: "customer" | "pro";
}

const STATUS_LABEL: Record<Job["status"], string> = {
  pending: "Awaiting quote",
  negotiating: "Quote sent",
  accepted: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<Job["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  negotiating: "bg-accent/20 text-accent-foreground",
  accepted: "bg-primary-soft text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export const JobThread = ({ job, pro, perspective = "customer" }: JobThreadProps) => {
  const { submitQuote, acceptQuote, completeJob, rateJob, sendMessage, cancelJob } = useApp();
  const category = getCategory(job.category);
  const commissionPct = category?.commissionPct ?? job.commissionPct;

  const [complexity, setComplexity] = useState<string>("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const previewTotal = useMemo(() => {
    const n = Number(complexity) || 0;
    const total = job.baseRateNu + Math.max(0, n);
    const fee = Math.round(total * (commissionPct / 100));
    return { total, fee, payout: total - fee };
  }, [complexity, job.baseRateNu, commissionPct]);

  const isUnlocked = job.status === "accepted" || job.status === "completed";

  const handleQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(complexity);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Enter a valid Nu. amount.");
      return;
    }
    submitQuote(job.id, n);
    toast.success("Quote sent to customer.");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(job.id, perspective, message);
    setMessage("");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
      <header className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-mint grid place-items-center font-display font-semibold text-secondary-foreground">
            {pro.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold truncate">{pro.name} · {category?.name}</p>
            <p className="text-xs text-muted-foreground truncate">Job #{job.id.slice(0, 6).toUpperCase()} · {new Date(job.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <Badge className={cn("rounded-full font-medium", STATUS_TONE[job.status])} variant="outline">
          {STATUS_LABEL[job.status]}
        </Badge>
      </header>

      {/* Contact panel */}
      <div className="px-5 py-3 bg-muted/40 grid sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {isUnlocked ? <Phone className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />}
          <span className={cn(isUnlocked && "text-foreground font-medium")}>
            {isUnlocked ? pro.phone : maskPhone(pro.phone)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {isUnlocked ? <MapPin className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />}
          <span className={cn(isUnlocked && "text-foreground font-medium")}>
            {isUnlocked ? pro.preciseAddress : maskAddress(pro.preciseAddress, pro.generalArea)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="px-5 py-4 max-h-72 overflow-y-auto space-y-2.5 bg-background">
        {job.messages.map((m) => {
          const mine = m.from === perspective;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                  mine
                    ? "bg-gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary-soft text-secondary-foreground rounded-bl-md",
                )}
              >
                {m.text}
                <div className={cn("text-[10px] mt-1 opacity-75")}>
                  {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote summary if exists */}
      {job.status !== "pending" && (
        <div className="px-5 py-4 border-t border-border/60 bg-secondary-soft/40">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quote breakdown</p>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Total charge" value={formatNu(job.totalChargeNu)} accent />
            <Stat label={`Platform fee (${commissionPct}%)`} value={formatNu(job.platformFeeNu)} />
            <Stat label="Pro payout" value={formatNu(job.payoutNu)} />
          </div>
        </div>
      )}

      {/* Action panels */}
      {perspective === "pro" && job.status === "pending" && (
        <form onSubmit={handleQuote} className="px-5 py-4 border-t border-border/60 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="complexity">Complexity fee (Nu.)</Label>
            <Input
              id="complexity"
              inputMode="numeric"
              value={complexity}
              onChange={(e) => setComplexity(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-3 grid grid-cols-3 gap-2">
            <Stat label="Total charge" value={formatNu(previewTotal.total)} accent />
            <Stat label={`Platform fee (${commissionPct}%)`} value={formatNu(previewTotal.fee)} />
            <Stat label="Your payout" value={formatNu(previewTotal.payout)} />
          </div>
          <Button type="submit" variant="hero" className="w-full">Send quote</Button>
        </form>
      )}

      {perspective === "customer" && job.status === "negotiating" && (
        <div className="px-5 py-4 border-t border-border/60 flex flex-wrap gap-2">
          <Button variant="hero" className="flex-1" onClick={() => { acceptQuote(job.id); toast.success("Accepted. Contact info unlocked."); }}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Accept quote
          </Button>
          <Button variant="outline" onClick={() => { cancelJob(job.id); toast("Job cancelled."); }}>
            Decline
          </Button>
        </div>
      )}

      {perspective === "customer" && job.status === "accepted" && (
        <div className="px-5 py-4 border-t border-border/60">
          <Button variant="mint" className="w-full" onClick={() => { completeJob(job.id); toast.success("Marked as completed. Please rate the pro."); }}>
            Mark as completed
          </Button>
        </div>
      )}

      {perspective === "customer" && job.status === "completed" && typeof job.rating !== "number" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (rating < 1) { toast.error("Please choose a rating."); return; }
            rateJob(job.id, rating, comment);
            toast.success("Thank you! Reputation updated.");
          }}
          className="px-5 py-4 border-t border-border/60 space-y-3"
        >
          <p className="text-sm font-medium">Rate this pro</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star className={cn("h-7 w-7 transition-smooth", n <= rating ? "fill-accent text-accent" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share a brief, mindful note (optional)" rows={2} className="rounded-xl" />
          <Button type="submit" variant="hero" className="w-full">Submit rating</Button>
        </form>
      )}

      {typeof job.rating === "number" && (
        <div className="px-5 py-3 border-t border-border/60 bg-secondary-soft/40 text-sm flex items-center gap-2">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="font-medium">{job.rating.toFixed(1)}</span>
          {job.ratingComment && <span className="text-muted-foreground">— "{job.ratingComment}"</span>}
        </div>
      )}

      {/* Chat input — available while not completed/cancelled */}
      {(job.status === "pending" || job.status === "negotiating" || job.status === "accepted") && (
        <>
          <Separator />
          <form onSubmit={handleSend} className="px-3 py-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground ml-1" />
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message…"
              className="flex-1 rounded-full h-10"
            />
            <Button type="submit" size="icon" variant="hero" className="rounded-full h-10 w-10" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <div className={cn("rounded-xl px-3 py-2", accent ? "bg-primary-soft" : "bg-background")}>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("text-sm font-semibold mt-0.5", accent && "text-primary")}>{value}</p>
  </div>
);
