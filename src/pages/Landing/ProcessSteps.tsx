import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './SectionHeading';
import { CTA_LABEL, QUIZ_LINK, processHeading, processSteps, sectionEyebrows } from './content';
import { processStepIcons } from './icons';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * A timeline, not three floating text columns: one rail connects the steps
 * (horizontal from md up, vertical below it) so the order is carried by the
 * layout instead of by a bare "→" glyph typed between the columns.
 */
export function ProcessSteps() {
  return (
    <section className="bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-shell">
        <SectionHeading eyebrow={sectionEyebrows.process} title={processHeading} />

        <motion.ol
          className="relative mt-12 grid list-none grid-cols-1 gap-8 md:grid-cols-3 md:gap-7"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {/* Desktop rail, fading at both ends so it reads as a path rather than
              a border. Sits behind the badges, which carry their own background. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-7 hidden h-px bg-[linear-gradient(90deg,transparent_2%,color-mix(in_srgb,var(--accent)_55%,transparent)_18%,color-mix(in_srgb,var(--accent)_55%,transparent)_82%,transparent_98%)] md:block"
          />

          {processSteps.map((step, idx) => (
            <motion.li key={step.number} className="group relative" variants={itemVariants}>
              {/* Mobile rail segment between this badge and the next one. */}
              {idx < processSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-7 top-14 h-[calc(100%-1.5rem)] w-px bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_45%,transparent),transparent)] md:hidden"
                />
              )}

              <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-white text-accent shadow-[0_6px_18px_-8px_rgba(0,0,0,0.35)] transition-colors duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                  {processStepIcons[step.icon]}
                </span>

                <div className="min-w-0 md:mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep">
                    Schritt {step.number}
                  </p>
                  <p className="mt-1.5 font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-primary">
                    {step.title}
                  </p>
                  <p className="mx-auto mt-2 max-w-[36ch] text-[14.5px] leading-relaxed text-text/75">
                    {step.body}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>

        {/* The live job ad repeats the CTA right after this section. */}
        <div className="mt-14 flex justify-center">
          <Button asChild size="lg" className="rounded-full">
            <a href={QUIZ_LINK}>{CTA_LABEL}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
