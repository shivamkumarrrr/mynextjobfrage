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
    <section className="mx-auto max-w-shell px-5 pt-12 md:px-10 md:pt-16">
      <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl">
        Die wichtigsten Fakten im Überblick
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-y-8">
        {displayBenefits.map((benefit, i) => (
          <div key={benefit} className="flex items-start gap-4">
            <span className="mt-0.5 shrink-0 text-accent">{benefitIcons[displayIcons[i]]}</span>
            <p className="text-[15px] leading-relaxed text-text">{benefit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
