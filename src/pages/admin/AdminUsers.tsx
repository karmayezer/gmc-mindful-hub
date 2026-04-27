import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/store/app-store";
import { getIdDocType } from "@/data/marketplace";
import { downloadCsv, maskCid } from "@/lib/admin-utils";

const AdminUsers = () => {
  const { registry, jobs, setUserStatus } = useApp();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return registry;
    return registry.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        u.phone.toLowerCase().includes(term) ||
        u.residenceAddress.toLowerCase().includes(term),
    );
  }, [registry, q]);

  const repeatBookers = useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach((j) => counts.set(j.customerId, (counts.get(j.customerId) ?? 0) + 1));
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id));
  }, [jobs]);

  const handleExport = () => {
    downloadCsv(
      `gmc-users-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((u) => ({
        Username: u.username,
        Phone: u.phone,
        CID_Masked: maskCid(u.cid),
        Residence: u.residenceAddress,
        Status: u.status ?? "active",
        Created: new Date(u.createdAt).toISOString(),
        LastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
        Bookings: jobs.filter((j) => j.customerId === u.id).length,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">User Directory</h1>
          <p className="text-sm text-muted-foreground">
            All registered GMC residents · {registry.length} total · {repeatBookers.size} repeat bookers
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, address"
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CID</TableHead>
                <TableHead>Residence</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No registered users yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const bookings = jobs.filter((j) => j.customerId === u.id).length;
                  const status = u.status ?? "active";
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.username}
                        {repeatBookers.has(u.id) && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">Repeat</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{u.phone}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="text-muted-foreground mr-1">{getIdDocType(u.idDocType).label}:</span>
                        {maskCid(u.idDocNumber || u.cid || "")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[260px] truncate">
                        {u.residenceAddress}
                      </TableCell>
                      <TableCell>{bookings}</TableCell>
                      <TableCell>
                        <Badge variant={status === "active" ? "secondary" : "destructive"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setUserStatus(u.id, status === "active" ? "suspended" : "active")
                          }
                        >
                          {status === "active" ? "Suspend" : "Reactivate"}
                        </Button>
                      </TableCell>
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

export default AdminUsers;
