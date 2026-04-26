import { useMemo } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/marketplace";
import { buildRevenueSeries, completedJobs, downloadCsv, fmtNu, getCategoryName } from "@/lib/admin-utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminFinance = () => {
  const { jobs, pros, categoryCommission, setCategoryCommission, admin } = useApp();
  const isAdmin = admin?.role === "admin";

  const txns = useMemo(() => completedJobs(jobs), [jobs]);
  const totals = useMemo(() => {
    const gross = txns.reduce((acc, j) => acc + j.totalChargeNu, 0);
    const commission = txns.reduce((acc, j) => acc + j.platformFeeNu, 0);
    const payouts = txns.reduce((acc, j) => acc + j.payoutNu, 0);
    return { gross, commission, payouts };
  }, [txns]);

  const series = useMemo(() => buildRevenueSeries(jobs), [jobs]);

  const handleExport = () => {
    downloadCsv(
      `gmc-finance-${new Date().toISOString().slice(0, 10)}.csv`,
      txns.map((j) => {
        const pro = pros.find((p) => p.id === j.proId);
        return {
          Date: new Date(j.completedAt ?? j.acceptedAt ?? j.createdAt).toISOString(),
          Pro: pro?.name ?? "—",
          Category: getCategoryName(j.category),
          Total_Nu: j.totalChargeNu,
          Commission_Nu: j.platformFeeNu,
          CommissionPct: j.commissionPct,
          Payout_Nu: j.payoutNu,
          Status: j.status,
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Financial Oversight</h1>
          <p className="text-sm text-muted-foreground">
            Real-time view of platform commission across GMC categories.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={txns.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Download CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Gross volume</div>
            <div className="mt-2 font-display text-2xl font-semibold">{fmtNu(totals.gross)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Commission earned</div>
            <div className="mt-2 font-display text-2xl font-semibold text-primary">{fmtNu(totals.commission)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pro payouts</div>
            <div className="mt-2 font-display text-2xl font-semibold">{fmtNu(totals.payouts)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Revenue trend · 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtNu(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Commission rates by category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{c.name}</div>
                  <div className="font-mono text-sm text-primary">{categoryCommission[c.id]}%</div>
                </div>
                <Label className="text-xs text-muted-foreground">10%–15%</Label>
                <Input
                  type="number"
                  min={10}
                  max={15}
                  step={0.5}
                  value={categoryCommission[c.id]}
                  disabled={!isAdmin}
                  onChange={(e) => setCategoryCommission(c.id, Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          {!isAdmin && (
            <p className="text-xs text-muted-foreground mt-3">
              Analyst role is read-only. Sign in as admin to adjust rates.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Transaction history · {txns.length}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No completed transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                txns
                  .slice()
                  .sort((a, b) => (b.completedAt ?? b.acceptedAt ?? b.createdAt) - (a.completedAt ?? a.acceptedAt ?? a.createdAt))
                  .map((j) => {
                    const pro = pros.find((p) => p.id === j.proId);
                    const date = new Date(j.completedAt ?? j.acceptedAt ?? j.createdAt);
                    return (
                      <TableRow key={j.id}>
                        <TableCell className="text-xs">{date.toLocaleString("en-GB")}</TableCell>
                        <TableCell className="font-medium">{pro?.name ?? "—"}</TableCell>
                        <TableCell>{getCategoryName(j.category)}</TableCell>
                        <TableCell className="text-right font-mono">{fmtNu(j.totalChargeNu)}</TableCell>
                        <TableCell className="text-right font-mono text-primary">{fmtNu(j.platformFeeNu)}</TableCell>
                        <TableCell className="text-right font-mono">{fmtNu(j.payoutNu)}</TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;
