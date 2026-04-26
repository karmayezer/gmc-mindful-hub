import {
  Wrench,
  Zap,
  Car,
  Cog,
  Sparkles,
  Hammer,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "plumbing"
  | "electrician"
  | "driver"
  | "mechanic"
  | "cleaner"
  | "masonry";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  /** Configurable platform commission per category (10–15%). */
  commissionPct: number;
}

export const CATEGORIES: Category[] = [
  { id: "plumbing", name: "Plumbing", tagline: "Pipes, taps & drainage", icon: Wrench, commissionPct: 12 },
  { id: "electrician", name: "Electrician", tagline: "Wiring & safe installs", icon: Zap, commissionPct: 13 },
  { id: "driver", name: "Driver", tagline: "Local transport on-call", icon: Car, commissionPct: 10 },
  { id: "mechanic", name: "Mechanic", tagline: "Vehicle care & repair", icon: Cog, commissionPct: 12 },
  { id: "cleaner", name: "Cleaner", tagline: "Mindful, thorough cleaning", icon: Sparkles, commissionPct: 15 },
  { id: "masonry", name: "Masonry", tagline: "Stone, brick & finishing", icon: Hammer, commissionPct: 12 },
];

export const getCategory = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);

export interface Pro {
  id: string;
  name: string;
  category: CategoryId;
  bio: string;
  certified: boolean;
  avgRating: number;        // 1–5
  totalJobs: number;
  baseRateNu: number;       // Market base rate in Nu.
  yearsExperience: number;
  // Sensitive — masked until a job is "Accepted".
  phone: string;
  preciseAddress: string;
  generalArea: string;
  avatarSeed: string;
  /** Admin-controlled listing status. Defaults to active. */
  status?: "active" | "suspended";
  /** Optional certification reference shown in admin views. */
  certificationId?: string;
}

export const MOCK_PROS: Pro[] = [
  // Plumbing
  { id: "p1", name: "Tashi Dorji", category: "plumbing", bio: "Decade-long experience with residential plumbing across Gelephu.", certified: true, avgRating: 4.8, totalJobs: 142, baseRateNu: 350, yearsExperience: 11, phone: "+975-17-555-0102", preciseAddress: "House 14, Lhamoizingkha St", generalArea: "GMC Sector A", avatarSeed: "tashi" },
  { id: "p2", name: "Kinley Wangmo", category: "plumbing", bio: "Quick, neat, and trusted with leak repairs and new installs.", certified: true, avgRating: 4.6, totalJobs: 88, baseRateNu: 320, yearsExperience: 7, phone: "+975-17-555-0103", preciseAddress: "Apt 3B, Riverside Block", generalArea: "GMC Sector B", avatarSeed: "kinley" },
  { id: "p3", name: "Sonam Penjor", category: "plumbing", bio: "Specialist in pressurised systems and water-saving fixtures.", certified: false, avgRating: 4.1, totalJobs: 31, baseRateNu: 280, yearsExperience: 4, phone: "+975-17-555-0104", preciseAddress: "Plot 22, Jigme Lane", generalArea: "GMC Sector C", avatarSeed: "sonam" },

  // Electrician
  { id: "e1", name: "Pema Tshering", category: "electrician", bio: "Licensed electrician — full home wiring, smart panels, EV chargers.", certified: true, avgRating: 4.9, totalJobs: 204, baseRateNu: 420, yearsExperience: 14, phone: "+975-17-555-0201", preciseAddress: "Block C, Solar Heights", generalArea: "GMC Sector A", avatarSeed: "pema" },
  { id: "e2", name: "Karma Choden", category: "electrician", bio: "Friendly and meticulous. Lighting, switchboards, troubleshooting.", certified: true, avgRating: 4.5, totalJobs: 76, baseRateNu: 380, yearsExperience: 6, phone: "+975-17-555-0202", preciseAddress: "House 9, Mindful Way", generalArea: "GMC Sector B", avatarSeed: "karma" },
  { id: "e3", name: "Ugyen Dorji", category: "electrician", bio: "Reliable for industrial wiring and emergency call-outs.", certified: false, avgRating: 3.8, totalJobs: 22, baseRateNu: 350, yearsExperience: 3, phone: "+975-17-555-0203", preciseAddress: "Plot 11, North Ave", generalArea: "GMC Sector D", avatarSeed: "ugyen" },

  // Driver
  { id: "d1", name: "Jigme Norbu", category: "driver", bio: "Calm, courteous driver — sedan & SUV. City and inter-dzongkhag.", certified: true, avgRating: 4.7, totalJobs: 318, baseRateNu: 250, yearsExperience: 12, phone: "+975-17-555-0301", preciseAddress: "House 5, Drukpa Lane", generalArea: "GMC Sector A", avatarSeed: "jigme" },
  { id: "d2", name: "Dechen Yangzom", category: "driver", bio: "Experienced female driver, families and elderly preferred.", certified: true, avgRating: 4.9, totalJobs: 167, baseRateNu: 280, yearsExperience: 8, phone: "+975-17-555-0302", preciseAddress: "Apt 7, Lotus Block", generalArea: "GMC Sector B", avatarSeed: "dechen" },

  // Mechanic
  { id: "m1", name: "Namgay Tenzin", category: "mechanic", bio: "Master mechanic — Toyota, Hyundai, Mahindra and EVs.", certified: true, avgRating: 4.6, totalJobs: 121, baseRateNu: 500, yearsExperience: 15, phone: "+975-17-555-0401", preciseAddress: "Garage 2, Industrial Rd", generalArea: "GMC Workshop Zone", avatarSeed: "namgay" },
  { id: "m2", name: "Yeshey Dorji", category: "mechanic", bio: "Engine diagnostics specialist with mobile service.", certified: false, avgRating: 4.2, totalJobs: 47, baseRateNu: 450, yearsExperience: 5, phone: "+975-17-555-0402", preciseAddress: "Lot 12, South Yard", generalArea: "GMC Workshop Zone", avatarSeed: "yeshey" },

  // Cleaner
  { id: "c1", name: "Rinzin Lhamo", category: "cleaner", bio: "Mindful, eco-conscious deep cleaning for homes and offices.", certified: true, avgRating: 4.9, totalJobs: 256, baseRateNu: 220, yearsExperience: 9, phone: "+975-17-555-0501", preciseAddress: "Apt 5A, Cedar House", generalArea: "GMC Sector C", avatarSeed: "rinzin" },
  { id: "c2", name: "Tshering Yangki", category: "cleaner", bio: "Move-in / move-out cleans, windows, and sanitisation.", certified: true, avgRating: 4.4, totalJobs: 92, baseRateNu: 200, yearsExperience: 4, phone: "+975-17-555-0502", preciseAddress: "House 3, Willow St", generalArea: "GMC Sector A", avatarSeed: "tsheringy" },

  // Masonry
  { id: "ms1", name: "Dorji Wangchuk", category: "masonry", bio: "Skilled in stonework, plastering, and fine finishing.", certified: true, avgRating: 4.7, totalJobs: 73, baseRateNu: 600, yearsExperience: 18, phone: "+975-17-555-0601", preciseAddress: "Workshop 4, East Site", generalArea: "GMC Build Zone", avatarSeed: "dorji" },
  { id: "ms2", name: "Lhakpa Sherpa", category: "masonry", bio: "Brick, block, and decorative finishes — punctual team.", certified: false, avgRating: 4.0, totalJobs: 28, baseRateNu: 540, yearsExperience: 6, phone: "+975-17-555-0602", preciseAddress: "Site 9, West Block", generalArea: "GMC Build Zone", avatarSeed: "lhakpa" },
];

export const formatNu = (n: number): string =>
  `Nu. ${Math.round(n).toLocaleString("en-IN")}`;

export const maskPhone = (phone: string): string =>
  phone.replace(/(\+\d{3}-\d{2}-)(\d{3})(-\d{4})/, "$1•••$3");

export const maskAddress = (_addr: string, generalArea: string): string =>
  `${generalArea} · exact address shared after acceptance`;
