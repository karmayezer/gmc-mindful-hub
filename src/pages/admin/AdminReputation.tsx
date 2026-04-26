import { useMemo } from "react";
import { AlertTriangle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/store/app-store";
import { flagPros, getCategoryName } from "@/lib/admin-utils";

const AdminReputation = () => {
  const { jobs, pros, setProStatus } = useApp();

  const lowReviews = useMemo(
    () =>
      jobs
        .filter((j) => typeof j.rating === "number" && (j.rating as number) <= 2)
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    [jobs],
  );

  const flagged = useMemo(() => flagPros(pros), [pros]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Reputation Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Mindful Service Quality — anyone below 3.0 ★ is flagged for admin review.
        </p>
      </div>

      <Card className={flagged.length > 0 ? "border-destructive/40" : ""}>
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Flagged professionals · {flagged.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Avg rating</TableHead>
                <TableHead>Total jobs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    All professionals are above the 3.0 ★ threshold. ✦
                  </TableCell>
                </TableRow>
              ) : (
                flagged.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{getCategoryName(p.category)}</TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {p.avgRating.toFixed(2)} ★
                    </TableCell>
                    <TableCell>{p.totalJobs}</TableCell>
                    <TableCell>
                      <Badge variant={(p.status ?? "active") === "active" ? "secondary" : "destructive"}>
                        {p.status ?? "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setProStatus(p.id, (p.status ?? "active") === "active" ? "suspended" : "active")
                        }
                      >
                        {(p.status ?? "active") === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            1 & 2-star reviews · {lowReviews.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No low-star reviews submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                lowReviews.map((j) => {
                  const pro = pros.find((p) => p.id === j.proId);
                  return (
                    <TableRow key={j.id}>
                      <TableCell className="text-xs">
                        {new Date(j.completedAt ?? j.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="font-medium">{pro?.name ?? "—"}</TableCell>
                      <TableCell>{j.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{j.rating} ★</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[400px]">
                        {j.ratingComment ?? <span className="italic">No comment</span>}
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

export default AdminReputation;
