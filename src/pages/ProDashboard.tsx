import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp, type Job } from "@/store/app-store";
import { formatNu, getCategory } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Inbox, MessageCircle, CheckCircle2, Hourglass, Briefcase, ArrowRight, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Job["status"], string> = {
  pending: "Awaiting your quote",
  negotiating: "Quote sent",
  accepted: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<Job["status"], string> = {
  pending: "bg-accent/20 text-accent-foreground",
  negotiating: "bg-primary-soft text-primary",
  accepted: "bg-secondary text-secondary-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

/**
 * Pro Dashboard — the workplace for a logged-in Professional.
 *
 * Beginner explainer:
 * 1. We read the logged-in user from useApp(). If they aren't a PRO, we redirect.
 * 2. We filter the global jobs list down to only this pro's jobs (job.proId === user.proId).
 * 3. Tabs split those jobs by status so the worker sees what needs attention first.
 */
const ProDashboard = () => {
  const { user, jobs, pros, submitQuote, sendMessage, completeJob, cancelJob, categoryCommission } = useApp();

  // 🔍 The Pro's own listing record (used for approval gating + commission %).
  const myProRecord = pros.find((p) => p.id === user?.proId);
  const isApproved = myProRecord?.isApproved ?? false;

  // 🧮 Job List Logic — only jobs assigned to THIS pro (computed up-front so hook order is stable).
  const myJobs = useMemo(
    () => jobs.filter((j) => j.proId === user?.proId).sort((a, b) => b.createdAt - a.createdAt),
    [jobs, user?.proId],
  );

  const buckets = useMemo(
    () => ({
      pending: myJobs.filter((j) => j.status === "pending"),
      negotiating: myJobs.filter((j) => j.status === "negotiating"),
      accepted: myJobs.filter((j) => j.status === "accepted"),
      done: myJobs.filter((j) => j.status === "completed" || j.status === "cancelled"),
    }),
    [myJobs],
  );

  // 🔒 Route guard — only signed-in PROs can be here. (Hooks already run above.)
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "PRO") return <Navigate to="/" replace />;

  return (
    <section className="container py-10 lg:py-14 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Professional workspace</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Welcome, {user.username}</h1>
        <p className="text-muted-foreground">
          Your category: <span className="font-medium text-foreground">{getCategory(user.proCategory ?? "plumbing")?.name ?? "—"}</span>
          {" · "}Commission on this category:{" "}
          <span className="font-medium text-foreground">
            {(categoryCommission[user.proCategory ?? "plumbing"] ?? 12)}%
          </span>
        </p>
      </header>

      {/* Approval banner */}
      {!isApproved && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-display text-base font-semibold">Verification pending</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your profile isn't visible to customers yet. A GMC admin will review your details and approve your listing shortly.
              You can still receive quote requests once approved.
            </p>
          </div>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Inbox className="h-4 w-4" />} label="New requests" value={buckets.pending.length} tone="accent" />
        <StatCard icon={<Hourglass className="h-4 w-4" />} label="Negotiating" value={buckets.negotiating.length} tone="primary" />
        <StatCard icon={<Briefcase className="h-4 w-4" />} label="Active" value={buckets.accepted.length} tone="secondary" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={buckets.done.filter((j) => j.status === "completed").length} tone="muted" />
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-muted/60 flex flex-wrap h-auto">
          <TabsTrigger value="pending">New requests · {buckets.pending.length}</TabsTrigger>
          <TabsTrigger value="negotiating">Negotiating · {buckets.negotiating.length}</TabsTrigger>
          <TabsTrigger value="accepted">Active · {buckets.accepted.length}</TabsTrigger>
          <TabsTrigger value="done">History · {buckets.done.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          {buckets.pending.length === 0 ? (
            <EmptyState
              title="No new requests"
              hint={isApproved ? "When a customer requests a quote, it lands here." : "You'll start receiving requests after your profile is approved."}
            />
          ) : (
            <ul className="space-y-3">
              {buckets.pending.map((job) => (
                <PendingJobRow
                  key={job.id}
                  job={job}
                  commissionPct={categoryCommission[job.category] ?? job.commissionPct}
                  onSendQuote={(fee) => {
                    submitQuote(job.id, fee);
                    toast.success("Quote sent. Customer will receive it on My Jobs.");
                  }}
                  onDecline={() => {
                    cancelJob(job.id);
                    toast("Request declined.");
                  }}
                />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="negotiating" className="mt-0">
          {buckets.negotiating.length === 0 ? (
            <EmptyState title="Nothing in negotiation" hint="Quotes you've sent will appear here while you wait for the customer." />
          ) : (
            <ul className="space-y-3">
              {buckets.negotiating.map((job) => (
                <SimpleJobRow key={job.id} job={job} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-0">
          {buckets.accepted.length === 0 ? (
            <EmptyState title="No active jobs" hint="Once a quote is accepted, customer contact details unlock here." />
          ) : (
            <ul className="space-y-3">
              {buckets.accepted.map((job) => (
                <ActiveJobRow
                  key={job.id}
                  job={job}
                  onMessage={(text) => sendMessage(job.id, "pro", text)}
                  onComplete={() => {
                    completeJob(job.id);
                    toast.success("Marked complete. Customer will be invited to rate the job.");
                  }}
                />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="done" className="mt-0">
          {buckets.done.length === 0 ? (
            <EmptyState title="No history yet" hint="Completed and cancelled jobs are kept here." />
          ) : (
            <ul className="space-y-3">
              {buckets.done.map((job) => (
                <SimpleJobRow key={job.id} job={job} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default ProDashboard;

/* ---------------- helper UI ---------------- */

const StatCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "accent" | "primary" | "secondary" | "muted";
}) => {
  const toneClass = {
    accent: "bg-accent/15 text-accent-foreground",
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", toneClass)}>
        {icon}
        {label}
      </div>
      <p className="font-display text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Job["status"] }) => (
  <Badge variant="outline" className={cn("rounded-full font-medium", STATUS_TONE[status])}>
    {STATUS_LABEL[status]}
  </Badge>
);

const RowShell = ({ children }: { children: React.ReactNode }) => (
  <li className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-soft">{children}</li>
);

const PendingJobRow = ({
  job,
  commissionPct,
  onSendQuote,
  onDecline,
}: {
  job: Job;
  commissionPct: number;
  onSendQuote: (complexityFeeNu: number) => void;
  onDecline: () => void;
}) => {
  const [complexity, setComplexity] = useState("");
  const n = Number(complexity) || 0;
  const total = job.baseRateNu + Math.max(0, n);
  const fee = Math.round(total * (commissionPct / 100));
  const payout = total - fee;

  return (
    <RowShell>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold">{job.customerName}</p>
          <p className="text-xs text-muted-foreground">
            Job #{job.id.slice(0, 6).toUpperCase()} · {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <p className="text-sm mt-3 bg-muted/50 rounded-xl p-3 leading-relaxed">{job.description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (n < 0 || Number.isNaN(n)) {
            toast.error("Enter a valid Nu. amount.");
            return;
          }
          onSendQuote(n);
        }}
        className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3 items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor={`fee-${job.id}`} className="text-xs uppercase tracking-wider text-muted-foreground">
            Complexity fee (Nu.) — added to your base rate of {formatNu(job.baseRateNu)}
          </Label>
          <Input
            id={`fee-${job.id}`}
            inputMode="numeric"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDecline}>Decline</Button>
          <Button type="submit" variant="hero">
            Send quote <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Commission breakdown — shown BEFORE the pro hits "Send Quote" */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Total to customer" value={formatNu(total)} accent />
        <Mini label={`GMC fee (${commissionPct}%)`} value={formatNu(fee)} />
        <Mini label="Your payout" value={formatNu(payout)} />
      </div>
    </RowShell>
  );
};

const ActiveJobRow = ({
  job,
  onMessage,
  onComplete,
}: {
  job: Job;
  onMessage: (text: string) => void;
  onComplete: () => void;
}) => {
  const [msg, setMsg] = useState("");
  return (
    <RowShell>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold">{job.customerName}</p>
          <p className="text-xs text-muted-foreground">
            Job #{job.id.slice(0, 6).toUpperCase()} · accepted{" "}
            {job.acceptedAt ? new Date(job.acceptedAt).toLocaleDateString() : ""}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid sm:grid-cols-3 gap-2 mt-3">
        <Mini label="Total" value={formatNu(job.totalChargeNu)} accent />
        <Mini label={`GMC fee (${job.commissionPct}%)`} value={formatNu(job.platformFeeNu)} />
        <Mini label="Your payout" value={formatNu(job.payoutNu)} />
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">Customer contact unlocked</span>
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-foreground">Job address shared in messages</span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!msg.trim()) return;
          onMessage(msg.trim());
          setMsg("");
          toast.success("Message sent.");
        }}
        className="mt-3 flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Send a quick update to the customer…"
          className="flex-1 h-10 rounded-full"
        />
        <Button type="submit" variant="outline" size="sm">Send</Button>
      </form>

      <div className="mt-3 flex justify-end">
        <Button variant="mint" size="sm" onClick={onComplete}>
          Mark as completed
        </Button>
      </div>
    </RowShell>
  );
};

const SimpleJobRow = ({ job }: { job: Job }) => (
  <RowShell>
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <p className="font-display text-base font-semibold">{job.customerName}</p>
        <p className="text-xs text-muted-foreground">
          Job #{job.id.slice(0, 6).toUpperCase()} · {new Date(job.createdAt).toLocaleString()}
        </p>
      </div>
      <StatusBadge status={job.status} />
    </div>
    <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{job.description}</p>
    {job.status !== "pending" && (
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Mini label="Total" value={formatNu(job.totalChargeNu)} />
        <Mini label="Fee" value={formatNu(job.platformFeeNu)} />
        <Mini label="Payout" value={formatNu(job.payoutNu)} accent />
      </div>
    )}
  </RowShell>
);

const Mini = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <div className={cn("rounded-xl px-3 py-2", accent ? "bg-primary-soft" : "bg-muted/60")}>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("text-sm font-semibold mt-0.5", accent && "text-primary")}>{value}</p>
  </div>
);

const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
    <Inbox className="mx-auto h-9 w-9 text-muted-foreground" />
    <h2 className="font-display text-xl mt-3">{title}</h2>
    <p className="text-muted-foreground mt-1.5 text-sm max-w-md mx-auto">{hint}</p>
    <Button asChild variant="outline" size="sm" className="mt-5">
      <Link to="/services">Browse the marketplace</Link>
    </Button>
  </div>
);
