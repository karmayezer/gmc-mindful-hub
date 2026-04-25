import { Link } from "react-router-dom";
import { useApp } from "@/store/app-store";
import { JobThread } from "@/components/JobThread";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Inbox } from "lucide-react";

const MyJobs = () => {
  const { jobs, pros, user } = useApp();
  const [perspective, setPerspective] = useState<"customer" | "pro">("customer");

  if (!user) {
    return (
      <section className="container py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to view your jobs</h1>
        <p className="text-muted-foreground mt-2">Your active negotiations and history will appear here.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/services">Browse services</Link></Button>
      </section>
    );
  }

  const myJobs = jobs.filter((j) => j.customerId === user.id);

  return (
    <section className="container py-12 lg:py-14">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Your activity</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2">My jobs</h1>
        </div>
        <Tabs value={perspective} onValueChange={(v) => setPerspective(v as "customer" | "pro")}>
          <TabsList className="bg-muted/60">
            <TabsTrigger value="customer">Customer view</TabsTrigger>
            <TabsTrigger value="pro">Pro view (demo)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {myJobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-2xl mt-4">No jobs yet</h2>
          <p className="text-muted-foreground mt-2">Browse a category and request a quote to get started.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/services">Browse services</Link></Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {myJobs.map((job) => {
            const pro = pros.find((p) => p.id === job.proId);
            if (!pro) return null;
            return <JobThread key={job.id} job={job} pro={pro} perspective={perspective} />;
          })}
        </div>
      )}
    </section>
  );
};

export default MyJobs;
