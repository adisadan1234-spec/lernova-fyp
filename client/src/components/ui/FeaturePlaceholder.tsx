type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-950/20 bg-paper-100/80 p-5">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-mint-700">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-base font-bold tracking-[-0.02em] text-ink-950">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-ink-600">{description}</p>
    </div>
  );
}
