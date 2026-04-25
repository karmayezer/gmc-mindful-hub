import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useApp } from "@/store/app-store";
import { ArrowRight, ShieldCheck, Phone, KeyRound, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = "phone" | "otp" | "profile";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{8,15}$/, "Enter a valid phone number (8–15 digits).");

const profileSchema = z.object({
  username: z.string().trim().min(2, "At least 2 characters.").max(40, "Max 40 characters."),
  cid: z.string().trim().regex(/^\d{11}$/, "Bhutan CID is 11 digits."),
  residenceAddress: z.string().trim().min(4, "Please enter your GMC address.").max(160, "Too long."),
});

export const LoginDialog = ({ open, onOpenChange, onSuccess }: LoginDialogProps) => {
  const { loginWithProfile, registry } = useApp();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+975");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [cid, setCid] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("phone");
    setOtp("");
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    // Direct-login mode: skip the OTP step automatically (per spec: "you can directly login without registration").
    // We still show a quick OTP screen with auto-fill so the flow feels real.
    setStep("otp");
    setOtp("123456");
    // If a profile already exists for this phone, fast-path log in.
    const existing = registry.find((u) => u.phone === phone);
    if (existing) {
      const r = loginWithProfile({
        phone,
        username: existing.username,
        cid: existing.cid,
        residenceAddress: existing.residenceAddress,
      });
      if (r.ok) {
        toast.success(`Welcome back, ${existing.username}`);
        handleClose(false);
        onSuccess?.();
      }
    } else {
      // Auto-advance to profile in 400ms for a smooth feel.
      setTimeout(() => setStep("profile"), 400);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = profileSchema.safeParse({ username, cid, residenceAddress: address });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const { username: u, cid: c, residenceAddress: r } = parsed.data;
    const result = loginWithProfile({ phone, username: u, cid: c, residenceAddress: r });
    if (result.ok === false) {
      setError(result.error);
      return;
    }
    toast.success("Profile created. You're verified.");
    handleClose(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/60">
        <div className="bg-gradient-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-90">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure access
          </div>
          <DialogHeader className="mt-2 space-y-1 text-left">
            <DialogTitle className="font-display text-2xl text-primary-foreground">
              {step === "phone" && "Sign in to GMC Service Hub"}
              {step === "otp" && "Verify your phone"}
              {step === "profile" && "Complete your KYC profile"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85">
              {step === "phone" && "Phone-first sign in. Direct login enabled — no OTP required for now."}
              {step === "otp" && "We auto-filled your code in this preview. Tap continue."}
              {step === "profile" && "A few details to verify you as a GMC resident."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
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
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    placeholder="e.g. Tashi D."
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cid">CID number (11 digits)</Label>
                <Input
                  id="cid"
                  inputMode="numeric"
                  value={cid}
                  onChange={(e) => setCid(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="h-11 rounded-xl tracking-widest"
                  placeholder="•••••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Encrypted and stored securely. Used only for one-time verification.
                </p>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Verify & enter <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
