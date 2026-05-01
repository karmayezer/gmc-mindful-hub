import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp, type UserRole } from "@/store/app-store";
import {
  CATEGORIES,
  ID_DOC_TYPES,
  getIdDocType,
  type CategoryId,
  type IdDocType,
} from "@/data/marketplace";
import {
  ArrowRight,
  ShieldCheck,
  Phone,
  KeyRound,
  UserCircle2,
  Mail,
  Lock,
  Building2,
  Briefcase,
  Sparkles,
  FileCheck2,
  Upload,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = "phone" | "otp" | "profile";
type Mode = "resident" | "staff";

/** Allowed company email domain for GMC staff sign-in. */
const COMPANY_EMAIL_DOMAIN = "gmcservicehub.bt";

/** Map of company email → admin store username (which holds the real role + password). */
const STAFF_EMAIL_TO_USERNAME: Record<string, string> = {
  [`admin@${COMPANY_EMAIL_DOMAIN}`]: "admin",
  [`analyst@${COMPANY_EMAIL_DOMAIN}`]: "analyst",
};

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{8,15}$/, "Enter a valid phone number (8–15 digits).");

const staffEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(160, "Too long.")
  .refine(
    (email) => email.endsWith(`@${COMPANY_EMAIL_DOMAIN}`),
    `Only @${COMPANY_EMAIL_DOMAIN} company emails are allowed.`,
  );

export const LoginDialog = ({ open, onOpenChange, onSuccess }: LoginDialogProps) => {
  const { loginWithProfile, registry, adminLogin } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("resident");

  // Resident flow state
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+975");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [idDocType, setIdDocType] = useState<IdDocType>("cid");
  const [idDocNumber, setIdDocNumber] = useState("");
  const [address, setAddress] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("CUSTOMER");
  const [proCategory, setProCategory] = useState<CategoryId>("plumbing");
  const [error, setError] = useState<string | null>(null);
  // 4-step Pro verification wizard (BRD §9.1). Only used when signupRole === "PRO".
  const [proStep, setProStep] = useState<1 | 2 | 3 | 4>(1);
  const [credentialFileName, setCredentialFileName] = useState<string | null>(null);
  const [submittedAsPro, setSubmittedAsPro] = useState(false);

  // Staff flow state
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffError, setStaffError] = useState<string | null>(null);

  const reset = () => {
    setStep("phone");
    setOtp("");
    setError(null);
    setStaffError(null);
    setStaffPassword("");
    setProStep(1);
    setCredentialFileName(null);
    setSubmittedAsPro(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  /** Smart Entrance: route the user to their home based on role. */
  const routeForRole = (role: UserRole) => {
    if (role === "ANALYST") return "/gmc-admin-control";
    if (role === "PRO") return "/pro-dashboard";
    return "/services";
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setStep("otp");
    setOtp("123456");
    const existing = registry.find((u) => u.phone === phone);
    if (existing) {
      const r = loginWithProfile({
        phone,
        username: existing.username,
        idDocType: existing.idDocType,
        idDocNumber: existing.idDocNumber,
        residenceAddress: existing.residenceAddress,
        role: existing.role,
        proCategory: existing.proCategory,
      });
      if (r.ok) {
        toast.success(`Welcome back, ${existing.username}`);
        handleClose(false);
        onSuccess?.();
        navigate(routeForRole(r.user.role));
      }
    } else {
      setTimeout(() => setStep("profile"), 400);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields step-by-step so each error message is specific.
    if (username.trim().length < 2 || username.trim().length > 40) {
      setError("Username must be 2–40 characters.");
      return;
    }
    const docType = getIdDocType(idDocType);
    const trimmedDoc = idDocNumber.trim();
    if (!docType.pattern.test(trimmedDoc)) {
      setError(`Invalid ${docType.label}. ${docType.hint}.`);
      return;
    }
    if (address.trim().length < 4) {
      setError("Please enter your GMC address.");
      return;
    }

    const result = loginWithProfile({
      phone,
      username: username.trim(),
      idDocType,
      idDocNumber: trimmedDoc,
      residenceAddress: address.trim(),
      role: signupRole,
      proCategory: signupRole === "PRO" ? proCategory : undefined,
    });
    if (result.ok === false) {
      setError(result.error);
      return;
    }
    if (signupRole === "PRO") {
      // Show the "Wait State" screen instead of routing to the dashboard immediately.
      setSubmittedAsPro(true);
      setProStep(4);
      toast.success("Submitted for review. We'll notify you once an analyst approves your profile.");
      return;
    }
    toast.success("Profile created. You're verified.");
    handleClose(false);
    onSuccess?.();
    navigate(routeForRole(result.user.role));
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    const parsed = staffEmailSchema.safeParse(staffEmail);
    if (!parsed.success) {
      setStaffError(parsed.error.issues[0].message);
      return;
    }
    if (staffPassword.length < 6) {
      setStaffError("Enter your staff password.");
      return;
    }
    const adminUsername = STAFF_EMAIL_TO_USERNAME[parsed.data];
    if (!adminUsername) {
      setStaffError("This company email is not registered as staff.");
      return;
    }
    const res = adminLogin(adminUsername, staffPassword);
    if (res.ok === false) {
      setStaffError(res.error);
      return;
    }
    toast.success(`Welcome, ${adminUsername}. Entering Control Tower.`);
    handleClose(false);
    navigate("/gmc-admin-control");
  };

  const docMeta = getIdDocType(idDocType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/60 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-90">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure access
          </div>
          <DialogHeader className="mt-2 space-y-1 text-left">
            <DialogTitle className="font-display text-2xl text-primary-foreground">
              {mode === "staff"
                ? "GMC Staff sign in"
                : step === "phone"
                ? "Sign in to GMC Service Hub"
                : step === "otp"
                ? "Verify your phone"
                : "Complete your profile"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85">
              {mode === "staff"
                ? `Restricted to verified @${COMPANY_EMAIL_DOMAIN} accounts.`
                : step === "phone"
                ? "Phone-first sign in. One entrance for residents and professionals."
                : step === "otp"
                ? "We auto-filled your code in this preview. Tap continue."
                : "A few details to verify you and set up your role."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as Mode);
              setError(null);
              setStaffError(null);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="resident" className="gap-1.5">
                <UserCircle2 className="h-4 w-4" /> Resident
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-1.5">
                <Building2 className="h-4 w-4" /> Staff / Admin
              </TabsTrigger>
            </TabsList>

            {/* ---------------- Resident tab ---------------- */}
            <TabsContent value="resident" className="mt-0">
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        inputMode="tel"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 rounded-xl"
                        placeholder="+975 17 555 0123"
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Continue <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By continuing you agree to GMC Service Hub's terms and mindful-conduct guidelines.
                  </p>
                </form>
              )}

              {step === "otp" && (
                <div className="space-y-4 text-center">
                  <KeyRound className="mx-auto h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="font-medium text-foreground">{phone}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={() => setStep("profile")}
                    disabled={otp.length !== 6}
                  >
                    Verify & continue
                  </Button>
                </div>
              )}

              {step === "profile" && (
                <div className="space-y-4">
                  {/* Role selector — Customer vs Professional */}
                  <div className="space-y-2">
                    <Label>I'm signing up as</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <RoleCard
                        active={signupRole === "CUSTOMER"}
                        onClick={() => { setSignupRole("CUSTOMER"); setProStep(1); setSubmittedAsPro(false); }}
                        icon={<Sparkles className="h-4 w-4" />}
                        title="Customer"
                        sub="Book services"
                      />
                      <RoleCard
                        active={signupRole === "PRO"}
                        onClick={() => { setSignupRole("PRO"); setProStep(1); }}
                        icon={<Briefcase className="h-4 w-4" />}
                        title="Professional"
                        sub="Offer my services"
                      />
                    </div>
                  </div>

                  {/* ============ CUSTOMER: single-step form ============ */}
                  {signupRole === "CUSTOMER" && (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <NameField username={username} setUsername={setUsername} />
                      <IdDocFields
                        idDocType={idDocType}
                        setIdDocType={setIdDocType}
                        idDocNumber={idDocNumber}
                        setIdDocNumber={setIdDocNumber}
                        docMeta={docMeta}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="address">GMC residence address</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="h-11 rounded-xl"
                          placeholder="House / Apt, Sector, GMC"
                        />
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <Button type="submit" variant="hero" size="lg" className="w-full">
                        Verify & enter <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </form>
                  )}

                  {/* ============ PRO: 4-step Verification Vault (BRD §9.1) ============ */}
                  {signupRole === "PRO" && (
                    <div className="space-y-4">
                      <ProWizardStepper current={proStep} />

                      {proStep === 1 && (
                        <div className="space-y-4">
                          <StepHeader
                            icon={<FileCheck2 className="h-5 w-5 text-primary" />}
                            title="Identity capture"
                            sub="We verify every professional before they appear in customer search."
                          />
                          <NameField username={username} setUsername={setUsername} />
                          <IdDocFields
                            idDocType={idDocType}
                            setIdDocType={setIdDocType}
                            idDocNumber={idDocNumber}
                            setIdDocNumber={setIdDocNumber}
                            docMeta={docMeta}
                          />
                          <Button
                            variant="hero"
                            size="lg"
                            className="w-full"
                            onClick={() => {
                              setError(null);
                              if (username.trim().length < 2) { setError("Enter your full name."); return; }
                              if (!docMeta.pattern.test(idDocNumber.trim())) {
                                setError(`Invalid ${docMeta.label}. ${docMeta.hint}.`); return;
                              }
                              setProStep(2);
                            }}
                          >
                            Continue <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                          {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                      )}

                      {proStep === 2 && (
                        <div className="space-y-4">
                          <StepHeader
                            icon={<Briefcase className="h-5 w-5 text-primary" />}
                            title="Category selection"
                            sub="Pick exactly one specialty. You can request more later."
                          />
                          <div className="space-y-2">
                            <Label>Your service category</Label>
                            <Select value={proCategory} onValueChange={(v) => setProCategory(v as CategoryId)}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.tagline}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">GMC residence address</Label>
                            <Input
                              id="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="h-11 rounded-xl"
                              placeholder="House / Apt, Sector, GMC"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setProStep(1)}>Back</Button>
                            <Button
                              variant="hero"
                              className="flex-1"
                              onClick={() => {
                                if (address.trim().length < 4) { setError("Please enter your GMC address."); return; }
                                setError(null);
                                setProStep(3);
                              }}
                            >
                              Continue <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                          {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                      )}

                      {proStep === 3 && (
                        <div className="space-y-4">
                          <StepHeader
                            icon={<Upload className="h-5 w-5 text-primary" />}
                            title="Credentialing"
                            sub="Upload trade licenses or permits issued by GMC or national authorities."
                          />
                          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/40 px-4 py-8 cursor-pointer hover:bg-muted/60 transition-smooth">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {credentialFileName ?? "Tap to upload trade license / permit"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">PDF, JPG or PNG · up to 5 MB</span>
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setCredentialFileName(f.name);
                              }}
                            />
                          </label>
                          {credentialFileName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              {credentialFileName} ready for analyst review.
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            Demo note: file is referenced by name only; real upload activates with backend.
                          </p>
                          <form onSubmit={handleProfileSubmit} className="space-y-3">
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" className="flex-1" onClick={() => setProStep(2)}>Back</Button>
                              <Button type="submit" variant="hero" className="flex-1" disabled={!credentialFileName}>
                                Submit for review
                              </Button>
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                          </form>
                        </div>
                      )}

                      {proStep === 4 && submittedAsPro && (
                        <div className="space-y-5 text-center py-3">
                          <div className="mx-auto h-14 w-14 rounded-full bg-accent/20 grid place-items-center">
                            <Hourglass className="h-7 w-7 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg">Pending Analyst Review</h3>
                            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                              Your application is in the GMC verification queue. You'll be visible in customer search once an analyst approves your profile.
                            </p>
                          </div>
                          <div className="rounded-xl bg-secondary-soft/60 p-3 text-left text-xs space-y-1">
                            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{username}</span></div>
                            <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{CATEGORIES.find(c => c.id === proCategory)?.name}</span></div>
                            <div><span className="text-muted-foreground">Document:</span> <span className="font-medium">{docMeta.label}</span></div>
                          </div>
                          <Button
                            variant="hero"
                            className="w-full"
                            onClick={() => {
                              handleClose(false);
                              onSuccess?.();
                              navigate("/pro-dashboard");
                            }}
                          >
                            Open my dashboard
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ---------------- Staff / Admin tab ---------------- */}
            <TabsContent value="staff" className="mt-0">
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Company email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-email"
                      type="email"
                      autoComplete="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      placeholder={`name@${COMPANY_EMAIL_DOMAIN}`}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only <span className="font-medium text-foreground">@{COMPANY_EMAIL_DOMAIN}</span> addresses can sign in here.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-password"
                      type="password"
                      autoComplete="current-password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      placeholder="Your staff password"
                    />
                  </div>
                </div>
                {staffError && (
                  <Alert variant="destructive">
                    <AlertDescription>{staffError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Enter Control Tower <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                  <div className="font-medium text-foreground">Demo staff credentials</div>
                  <div>admin@{COMPANY_EMAIL_DOMAIN} / gmc-admin-2025</div>
                  <div>analyst@{COMPANY_EMAIL_DOMAIN} / gmc-analyst-2025</div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RoleCard = ({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-xl border p-3 transition-smooth ${
      active
        ? "border-primary bg-primary-soft ring-2 ring-primary/30"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <div className={`flex items-center gap-1.5 text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
      {icon}
      {title}
    </div>
    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
  </button>
);
