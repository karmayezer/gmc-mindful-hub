import { CategoryGrid } from "@/components/CategoryGrid";

const Services = () => {
  return (
    <section className="container py-12 lg:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Service directory</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2">Choose a category</h1>
        <p className="text-muted-foreground mt-3">
          All categories list KYC-verified residents of Gelephu, sorted automatically by their Professional Value score.
        </p>
      </div>
      <CategoryGrid />
    </section>
  );
};

export default Services;
