import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/store/app-store";

const AdminLogin = () => {
  const { adminLogin, admin } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (admin) {
    navigate("/gmc-admin-control", { replace: true });
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = adminLogin(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/gmc-admin-control", { replace: true });
  };

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </span>
            <CardTitle className="font-display">GMC Control Tower</CardTitle>
          </div>
          <CardDescription>
            Restricted access — for GMC analysts and administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or analyst"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" variant="hero" className="w-full">
              Enter Control Tower
            </Button>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">Demo credentials</div>
              <div>admin / gmc-admin-2025</div>
              <div>analyst / gmc-analyst-2025</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
