type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <section className="border-b border-espresso/10 bg-sand/40">
      <div className="container-page py-12 text-center sm:py-16 lg:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold-dark">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl leading-tight text-espresso sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mocha sm:mt-5 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
