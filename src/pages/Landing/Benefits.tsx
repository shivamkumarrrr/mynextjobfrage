import { Reveal } from '@/components/Reveal';
import { benefits } from './content';
import { benefitIcons } from './icons';

export function Benefits() {
  return (
    <section className="px-5 pt-11 md:px-10 md:pt-14">
      <Reveal className="mx-auto max-w-page">
        <h2 className="mt-1.5 font-display text-[1.35rem] font-extrabold tracking-[-0.2px] text-primary">
          Die wichtigsten Fakten im Überblick
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-[22px] md:grid-cols-2 md:gap-x-10">
          {benefits.map((benefit) => (
            <div key={benefit.text} className="flex items-start gap-3.5">
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,white)] text-accent">
                {benefitIcons[benefit.icon]}
              </span>
              <p className="pt-[9px] text-[14.5px] font-medium leading-snug text-text">
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
