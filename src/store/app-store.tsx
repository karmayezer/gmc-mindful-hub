import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MOCK_PROS, type Pro, type CategoryId } from "@/data/marketplace";

export interface UserProfile {
  id: string;
  phone: string;
  username: string;
  cid: string;            // 11-digit CID (stored masked in UI; in real app would be encrypted server-side)
  residenceAddress: string;
  createdAt: number;
}

export type JobStatus =
  | "pending"      // customer initiated, awaiting pro quote
  | "negotiating"  // pro sent quote, awaiting customer
  | "accepted"     // customer accepted; contact info unmasked
  | "completed"    // job done, awaiting / has rating
  | "cancelled";

export interface JobMessage {
  id: string;
  from: "customer" | "pro";
  text: string;
  at: number;
}

export interface Job {
  id: string;
  proId: string;
  customerId: string;
  customerName: string;
  category: CategoryId;
  description: string;
  status: JobStatus;
  baseRateNu: number;
  complexityFeeNu: number;          // negotiated additional fee
  totalChargeNu: number;            // base + complexity (gross to customer)
  commissionPct: number;            // 10–15
  platformFeeNu: number;
  payoutNu: number;
  rating?: number;                  // 1–5 once completed
  ratingComment?: string;
  messages: JobMessage[];
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

interface AppState {
  user: UserProfile | null;
  pros: Pro[];
  jobs: Job[];
  /** All registered profiles — used to enforce duplicate-CID prevention. */
  registry: UserProfile[];
}

interface AppContextValue extends AppState {
  loginWithProfile: (data: Omit<UserProfile, "id" | "createdAt">) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  createJob: (input: { proId: string; description: string }) => Job | null;
  submitQuote: (jobId: string, complexityFeeNu: number) => void;
  acceptQuote: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  completeJob: (jobId: string) => void;
  rateJob: (jobId: string, rating: number, comment?: string) => void;
  sendMessage: (jobId: string, from: "customer" | "pro", text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "gmc-service-hub:v1";

interface PersistedState {
  user: UserProfile | null;
  pros: Pro[];
  jobs: Job[];
  registry: UserProfile[];
}

const loadState = (): PersistedState => {
  if (typeof window === "undefined") {
    return { user: null, pros: MOCK_PROS, jobs: [], registry: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, pros: MOCK_PROS, jobs: [], registry: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      user: parsed.user ?? null,
      pros: parsed.pros && parsed.pros.length > 0 ? parsed.pros : MOCK_PROS,
      jobs: parsed.jobs ?? [],
      registry: parsed.registry ?? [],
    };
  } catch {
    return { user: null, pros: MOCK_PROS, jobs: [], registry: [] };
  }
};

const newId = () => Math.random().toString(36).slice(2, 10);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PersistedState>(() => loadState());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const loginWithProfile: AppContextValue["loginWithProfile"] = useCallback((data) => {
    let result: { ok: true } | { ok: false; error: string } = { ok: true };
    setState((prev) => {
      // Duplicate CID prevention.
      const existing = prev.registry.find((u) => u.cid === data.cid);
      if (existing && existing.phone !== data.phone) {
        result = { ok: false, error: "This CID is already registered with a different phone number." };
        return prev;
      }
      // Reuse existing profile by phone if present.
      const byPhone = prev.registry.find((u) => u.phone === data.phone);
      const profile: UserProfile = byPhone
        ? { ...byPhone, ...data }
        : { id: newId(), createdAt: Date.now(), ...data };
      const registry = byPhone
        ? prev.registry.map((u) => (u.id === byPhone.id ? profile : u))
        : [...prev.registry, profile];
      return { ...prev, user: profile, registry };
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, user: null }));
  }, []);

  const createJob: AppContextValue["createJob"] = useCallback(({ proId, description }) => {
    let created: Job | null = null;
    setState((prev) => {
      if (!prev.user) return prev;
      const pro = prev.pros.find((p) => p.id === proId);
      if (!pro) return prev;
      const job: Job = {
        id: newId(),
        proId,
        customerId: prev.user.id,
        customerName: prev.user.username,
        category: pro.category,
        description,
        status: "pending",
        baseRateNu: pro.baseRateNu,
        complexityFeeNu: 0,
        totalChargeNu: pro.baseRateNu,
        commissionPct: 12,
        platformFeeNu: 0,
        payoutNu: pro.baseRateNu,
        messages: [
          {
            id: newId(),
            from: "customer",
            text: description,
            at: Date.now(),
          },
        ],
        createdAt: Date.now(),
      };
      created = job;
      return { ...prev, jobs: [job, ...prev.jobs] };
    });
    return created;
  }, []);

  const submitQuote = useCallback((jobId: string, complexityFeeNu: number) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => {
        if (j.id !== jobId) return j;
        const total = j.baseRateNu + Math.max(0, complexityFeeNu);
        // Use category commission if available — else 12%.
        const fee = +(total * (j.commissionPct / 100)).toFixed(0);
        return {
          ...j,
          complexityFeeNu: Math.max(0, complexityFeeNu),
          totalChargeNu: total,
          platformFeeNu: fee,
          payoutNu: total - fee,
          status: "negotiating",
          messages: [
            ...j.messages,
            {
              id: newId(),
              from: "pro",
              text: `Quote sent: total Nu. ${total.toLocaleString("en-IN")} (base Nu. ${j.baseRateNu.toLocaleString("en-IN")} + complexity Nu. ${Math.max(0, complexityFeeNu).toLocaleString("en-IN")}).`,
              at: Date.now(),
            },
          ],
        };
      }),
    }));
  }, []);

  const acceptQuote = useCallback((jobId: string) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "accepted",
              acceptedAt: Date.now(),
              messages: [
                ...j.messages,
                {
                  id: newId(),
                  from: "customer",
                  text: "Quote accepted. Contact details have been shared.",
                  at: Date.now(),
                },
              ],
            }
          : j,
      ),
    }));
  }, []);

  const cancelJob = useCallback((jobId: string) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === jobId ? { ...j, status: "cancelled" } : j)),
    }));
  }, []);

  const completeJob = useCallback((jobId: string) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === jobId ? { ...j, status: "completed", completedAt: Date.now() } : j,
      ),
    }));
  }, []);

  const rateJob = useCallback((jobId: string, rating: number, comment?: string) => {
    setState((prev) => {
      const job = prev.jobs.find((j) => j.id === jobId);
      if (!job) return prev;
      const updatedJobs = prev.jobs.map((j) =>
        j.id === jobId ? { ...j, rating, ratingComment: comment, status: "completed" as JobStatus } : j,
      );
      // Recalculate the pro's avg rating across all rated jobs.
      const proRatings = updatedJobs
        .filter((j) => j.proId === job.proId && typeof j.rating === "number")
        .map((j) => j.rating as number);
      const avg = proRatings.length
        ? +(proRatings.reduce((a, b) => a + b, 0) / proRatings.length).toFixed(2)
        : rating;
      const updatedPros = prev.pros.map((p) =>
        p.id === job.proId ? { ...p, avgRating: avg, totalJobs: p.totalJobs + 1 } : p,
      );
      return { ...prev, jobs: updatedJobs, pros: updatedPros };
    });
  }, []);

  const sendMessage = useCallback((jobId: string, from: "customer" | "pro", text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              messages: [...j.messages, { id: newId(), from, text: text.trim(), at: Date.now() }],
            }
          : j,
      ),
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      loginWithProfile,
      logout,
      createJob,
      submitQuote,
      acceptQuote,
      cancelJob,
      completeJob,
      rateJob,
      sendMessage,
    }),
    [state, loginWithProfile, logout, createJob, submitQuote, acceptQuote, cancelJob, completeJob, rateJob, sendMessage],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};
