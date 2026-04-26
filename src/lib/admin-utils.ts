import type { Job } from "@/store/app-store";
import type { Pro } from "@/data/marketplace";
import { CATEGORIES, type CategoryId } from "@/data/marketplace";

export const fmtNu = (n: number): string =>
  `Nu. ${Math.round(n).toLocaleString("en-IN")}`;

export const maskCid = (cid: string): string => {
  if (!cid) return "—";
  if (cid.length < 4) return "•".repeat(cid.length);
  return `${cid.slice(0, 2)}${"•".repeat(Math.max(0, cid.length - 4))}${cid.slice(-2)}`;
};

export const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const dayLabel = (ts: number): string =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export const completedJobs = (jobs: Job[]): Job[] =>
  jobs.filter((j) => j.status === "completed" || j.status === "accepted");

export const jobsByCategory = (jobs: Job[]) => {
  const totals = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    requested: jobs.filter((j) => j.category === c.id).length,
    completed: jobs.filter((j) => j.category === c.id && j.status === "completed").length,
  }));
  return totals;
};

/** Build a 14-day series of unique active users (login dates). */
export const buildDauSeries = (logins: number[]) => {
  const today = startOfDay(Date.now());
  const days = Array.from({ length: 14 }, (_, i) => today - (13 - i) * 86_400_000);
  const set = new Set(logins.map(startOfDay));
  return days.map((d) => ({
    day: dayLabel(d),
    dau: set.has(d) ? logins.filter((l) => startOfDay(l) === d).length : 0,
  }));
};

/** Build a 14-day revenue series from completed/accepted jobs. */
export const buildRevenueSeries = (jobs: Job[]) => {
  const today = startOfDay(Date.now());
  const days = Array.from({ length: 14 }, (_, i) => today - (13 - i) * 86_400_000);
  const completed = completedJobs(jobs);
  return days.map((d) => {
    const dayJobs = completed.filter((j) => startOfDay(j.completedAt ?? j.acceptedAt ?? j.createdAt) === d);
    return {
      day: dayLabel(d),
      revenue: dayJobs.reduce((acc, j) => acc + j.platformFeeNu, 0),
      gross: dayJobs.reduce((acc, j) => acc + j.totalChargeNu, 0),
    };
  });
};

export const getCategoryName = (id: CategoryId): string =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;

export const flagPros = (pros: Pro[]): Pro[] =>
  pros.filter((p) => p.totalJobs >= 3 && p.avgRating < 3.0);

export const downloadCsv = (filename: string, rows: Record<string, string | number>[]) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (val: string | number) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
