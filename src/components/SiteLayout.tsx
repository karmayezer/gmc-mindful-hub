import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, ShieldCheck, User } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LoginDialog } from "@/components/LoginDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseNavLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/jobs", label: "My Jobs" },
  { to: "/about", label: "About GMC" },
];

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Pros see a dedicated dashboard link instead of "My Jobs".
  const navLinks = user?.role === "PRO"
    ? [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/pro-dashboard", label: "Pro Dashboard" },
        { to: "/about", label: "About GMC" },
      ]
    : baseNavLinks;

  const requireAuth = (path: string) => {
    if (user) navigate(path);
    else {
      setPendingPath(path);
      setLoginOpen(true);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-soft transition-smooth group-hover:scale-105">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold text-foreground">GMC Service Hub</span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Gelephu · Bhutan</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-mint text-secondary-foreground text-xs font-semibold">
                      {user.username.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    KYC Verified
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "PRO" ? (
                    <DropdownMenuItem onClick={() => navigate("/pro-dashboard")}>
                      <User className="mr-2 h-4 w-4" /> Pro Dashboard
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/jobs")}>
                      <User className="mr-2 h-4 w-4" /> My Jobs
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="hero" onClick={() => setLoginOpen(true)} className="rounded-full">
                Sign in
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-8 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-xl text-base font-medium transition-smooth ${
                          isActive
                            ? "bg-primary-soft text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border/60 bg-secondary-soft/60">
        <div className="container py-12 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-semibold">GMC Service Hub</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Mindful, secure connections between Gelephu Mindfulness City residents and certified service professionals.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-display text-base mb-3">Trust</h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>KYC-verified residents</li>
              <li>Certified professionals</li>
              <li>Transparent pricing</li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-display text-base mb-3">Region</h4>
            <p className="text-muted-foreground">
              Built for Gelephu Mindfulness City — Bhutan's special administrative region for mindful, sustainable living.
            </p>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © 2026 GMC Service Hub
        </div>
      </footer>

      <LoginDialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open) setPendingPath(null);
        }}
        onSuccess={() => {
          setLoginOpen(false);
          if (pendingPath) navigate(pendingPath);
          setPendingPath(null);
        }}
      />

      {/* Expose requireAuth via a global event so deep components can ask for login. */}
      <AuthBridge requireAuth={requireAuth} />
    </div>
  );
};

const AuthBridge = ({ requireAuth }: { requireAuth: (path: string) => void }) => {
  // Allows any component to dispatch:  window.dispatchEvent(new CustomEvent("require-auth", { detail: "/services" }))
  if (typeof window !== "undefined") {
    (window as unknown as { __requireAuth?: (p: string) => void }).__requireAuth = requireAuth;
  }
  return null;
};

export const requireAuthNav = (path: string) => {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as { __requireAuth?: (p: string) => void }).__requireAuth;
  if (fn) fn(path);
};
