import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/store/app-store";
import { CATEGORIES, type CategoryId, type Pro } from "@/data/marketplace";
import { fmtNu, getCategoryName } from "@/lib/admin-utils";
import { toast } from "@/hooks/use-toast";

interface FormState {
  id?: string;
  name: string;
  category: CategoryId;
  bio: string;
  certified: boolean;
  certificationId: string;
  baseRateNu: number;
  yearsExperience: number;
  phone: string;
  preciseAddress: string;
  generalArea: string;
  avgRating: number;
}

const blank = (): FormState => ({
  name: "",
  category: "plumbing",
  bio: "",
  certified: true,
  certificationId: "",
  baseRateNu: 300,
  yearsExperience: 1,
  phone: "+975-17-555-",
  preciseAddress: "",
  generalArea: "GMC Sector A",
  avgRating: 4.5,
});

const AdminPros = () => {
  const { pros, addPro, updatePro, removePro, setProStatus, setProApproval } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank());

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return pros.filter(
      (p) =>
        !t ||
        p.name.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t) ||
        getCategoryName(p.category).toLowerCase().includes(t),
    );
  }, [pros, q]);

  const openAdd = () => {
    setForm(blank());
    setOpen(true);
  };

  const openEdit = (p: Pro) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      bio: p.bio,
      certified: p.certified,
      certificationId: p.certificationId ?? "",
      baseRateNu: p.baseRateNu,
      yearsExperience: p.yearsExperience,
      phone: p.phone,
      preciseAddress: p.preciseAddress,
      generalArea: p.generalArea,
      avgRating: p.avgRating,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (form.id) {
      updatePro(form.id, {
        name: form.name,
        category: form.category,
        bio: form.bio,
        certified: form.certified,
        certificationId: form.certificationId || undefined,
        baseRateNu: Number(form.baseRateNu) || 0,
        yearsExperience: Number(form.yearsExperience) || 0,
        phone: form.phone,
        preciseAddress: form.preciseAddress,
        generalArea: form.generalArea,
        avgRating: Math.max(0, Math.min(5, Number(form.avgRating) || 0)),
      });
      toast({ title: "Professional updated" });
    } else {
      addPro({
        name: form.name,
        category: form.category,
        bio: form.bio,
        certified: form.certified,
        certificationId: form.certificationId || undefined,
        baseRateNu: Number(form.baseRateNu) || 0,
        yearsExperience: Number(form.yearsExperience) || 0,
        phone: form.phone,
        preciseAddress: form.preciseAddress,
        generalArea: form.generalArea,
        avatarSeed: form.name.toLowerCase().replace(/\s+/g, "-"),
        avgRating: Math.max(0, Math.min(5, Number(form.avgRating) || 4.5)),
      });
      toast({ title: "Professional added" });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Professionals</h1>
          <p className="text-sm text-muted-foreground">
            Manage certified service providers across GMC.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or category"
              className="pl-9 w-64"
            />
          </div>
          <Button variant="hero" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add professional
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Provider directory · {filtered.length}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Cert ID</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Base rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const status = p.status ?? "active";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.name}
                      {p.certified && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">Certified</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryName(p.category)}</TableCell>
                    <TableCell className="font-mono text-xs">{p.certificationId ?? "—"}</TableCell>
                    <TableCell>
                      <span className={p.avgRating < 3 ? "text-destructive font-semibold" : ""}>
                        {p.avgRating.toFixed(1)} ★
                      </span>
                    </TableCell>
                    <TableCell>{p.totalJobs}</TableCell>
                    <TableCell>{fmtNu(p.baseRateNu)}</TableCell>
                    <TableCell>
                      <Badge variant={status === "active" ? "secondary" : "destructive"}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setProStatus(p.id, status === "active" ? "suspended" : "active")
                        }
                      >
                        {status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remove ${p.name}? This cannot be undone.`)) removePro(p.id);
                        }}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {form.id ? "Edit professional" : "Add professional"}
            </DialogTitle>
            <DialogDescription>
              All fields prepare a public listing on the GMC marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as CategoryId })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Certification ID</Label>
              <Input
                value={form.certificationId}
                onChange={(e) => setForm({ ...form, certificationId: e.target.value })}
                placeholder="e.g. GMC-PL-0042"
              />
            </div>
            <div className="space-y-2">
              <Label>Market base rate (Nu.)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.baseRateNu}
                onChange={(e) => setForm({ ...form, baseRateNu: Number(e.target.value.replace(/[^\d]/g, "")) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Years of experience</Label>
              <Input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Manual rating override (0–5)</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={form.avgRating}
                onChange={(e) => setForm({ ...form, avgRating: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>General area</Label>
              <Input value={form.generalArea} onChange={(e) => setForm({ ...form, generalArea: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Precise address</Label>
              <Input value={form.preciseAddress} onChange={(e) => setForm({ ...form, preciseAddress: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="cert"
                type="checkbox"
                checked={form.certified}
                onChange={(e) => setForm({ ...form, certified: e.target.checked })}
              />
              <Label htmlFor="cert" className="cursor-pointer">Mark as Certified</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSave}>{form.id ? "Save changes" : "Add professional"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPros;
