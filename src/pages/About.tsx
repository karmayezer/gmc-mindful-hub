import { ShieldCheck, HandCoins, Sparkles, Mountain } from "lucide-react";
import heroImg from "@/assets/hero-gmc.jpg";

const About = () => {
  return (
    <>
      <section className="bg-hero">
        <div className="container py-16 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">About GMC Service Hub</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mt-3 leading-tight">
              Built for Gelephu Mindfulness City.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Gelephu Mindfulness City (GMC) is Bhutan's bold step toward a serene, sustainable, world-class economic hub — a place where commerce and well-being grow together. We're proud to be its dedicated service marketplace.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-elevated border border-border/60">
            <img src={heroImg} alt="Gelephu Mindfulness City landscape" loading="lazy" width={1536} height={1152} className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display text-3xl font-semibold">Our mission</h2>
          <p className="mt-4 text-muted-foreground">
            To provide a mindful, secure, and professional connection between GMC residents and certified service providers. Every connection should feel calm, dignified, and fair to both sides.
          </p>
          <p className="mt-3 text-muted-foreground">
            We do this through verified identities, transparent Nu. pricing, real-time reputation, and a workflow that protects both customers and pros from disintermediation and disputes.
          </p>
        </div>
        <ul className="grid gap-4">
          {[
            { icon: ShieldCheck, title: "Verified identities", body: "Phone-OTP plus Bhutan CID-based KYC for every resident and every pro." },
            { icon: HandCoins, title: "Transparent commission", body: "10–15% platform fee shown to the pro before they submit any quote." },
            { icon: Sparkles, title: "Real-time reputation", body: "Pro ratings update instantly. Below 3.0 average flags an account for review." },
            { icon: Mountain, title: "Rooted in Bhutan", body: "All prices in Nu. The aesthetic, the conduct, the values — distinctly local." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={i} className="flex gap-4 rounded-2xl bg-card border border-border/60 p-5 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
};

export default About;
