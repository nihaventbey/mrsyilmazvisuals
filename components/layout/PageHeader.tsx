type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <section className="border-b border-espresso/10 bg-sand/40">
      <div className="container-page py-16 text-center lg:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold-dark">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl text-espresso sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-mocha">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
