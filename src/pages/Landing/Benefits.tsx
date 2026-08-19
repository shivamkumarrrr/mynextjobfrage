import { benefits } from './content';
import { benefitIcons } from './icons';

const benefitIconKeys: (keyof typeof benefitIcons)[] = [
  'coins',
  'target',
  'shield',
  'calendar',
  'rocket',
  'bike',
  'wifi',
  'graduation',
  'trending',
];

export function Benefits() {
  const weakIndices = new Set([2, 5, 7]);
  const displayBenefits = benefits.filter((_, i) => !weakIndices.has(i));
  const displayIcons = benefitIconKeys.filter((_, i) => !weakIndices.has(i));

  return (
    <section className="bg-[color-mix(in_srgb,var(--accent)_5%,white)] px-5 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-shell">
        <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl">
          Die wichtigsten Fakten im Überblick
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {displayBenefits.map((benefit, i) => (
            <div
              key={benefit}
              className="group flex items-start gap-3.5 rounded-brand border border-border bg-white px-4 py-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,white)] text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                {benefitIcons[displayIcons[i]]}
              </span>
              <p className="pt-1.5 text-[15px] leading-relaxed text-text">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
