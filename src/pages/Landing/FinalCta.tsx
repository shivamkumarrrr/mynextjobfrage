import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './SectionHeading';
import { CTA_LABEL, QUIZ_LINK, finalCta, sectionEyebrows } from './content';

export function FinalCta() {
  return (
    <section className="bg-[color-mix(in_srgb,var(--accent)_5%,white)] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[620px] text-center">
        <SectionHeading
          eyebrow={sectionEyebrows.finalCta}
          title={finalCta.heading}
          align="center"
        />
        <motion.div
          data-final-cta
          className="mt-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button asChild size="lg" className="rounded-full">
            <a href={QUIZ_LINK}>{CTA_LABEL}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
