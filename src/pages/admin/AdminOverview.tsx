import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Briefcase, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { useApp } from "@/store/app-store";
import {
  buildDauSeries,
  buildRevenueSeries,
  fmtNu,
  flagPros,
  jobsByCategory,
} from "@/lib/admin-utils";

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const { jobs, registry, pros } = useApp();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dauToday = useMemo(
    () => registry.filter((u) => (u.lastLoginAt ?? 0) >= today.getTime()).length,
    [registry, today],
  );

  const totalRevenue = useMemo(
    () => jobs.filter((j) => j.status === "completed" || j.status === "accepted")
      .reduce((acc, j) => acc + j.platformFeeNu, 0),
    [jobs],
  );

  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const requestedCount = jobs.length;

  const dauSeries = useMemo(
    () => buildDauSeries(registry.map((u) => u.lastLoginAt ?? u.createdAt)),
    [registry],
  );
  const revenueSeries = useMemo(() => buildRevenueSeries(jobs), [jobs]);
  const categoryStats = useMemo(() => jobsByCategory(jobs), [jobs]);

  const flagged = flagPros(pros);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Mindfulness City Growth</h1>
        <p className="text-sm text-muted-foreground">
          Real-time pulse of the GMC service marketplace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Daily Active Users" value={String(dauToday)} hint="Logins today" />
        <StatCard icon={Briefcase} label="Jobs Requested" value={String(requestedCount)} hint="All time" />
        <StatCard icon={CheckCircle2} label="Jobs Completed" value={String(completedCount)} hint={`${requestedCount === 0 ? 0 : Math.round((completedCount / requestedCount) * 100)}% completion`} />
        <StatCard icon={TrendingUp} label="Platform Revenue" value={fmtNu(totalRevenue)} hint="Commission earned" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Logins · last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dauSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="dau" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Active users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Revenue · last 14 days (Nu.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => fmtNu(v)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Commission" />
                  <Line type="monotone" dataKey="gross" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} dot={false} name="Gross volume" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Service volume by category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="requested" fill="hsl(var(--primary))" name="Requested" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="hsl(var(--secondary))" name="Completed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {flagged.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Badge variant="destructive">Mindful Service Quality alert</Badge>
              {flagged.length} professional{flagged.length === 1 ? "" : "s"} below 3.0 ★
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Review these professionals on the Reputation tab.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOverview;
