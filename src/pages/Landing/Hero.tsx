import { motion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { JobInfoCard } from './JobInfoCard';
import { CTA_LABEL, QUIZ_LINK, hero } from './content';

const contentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  return (
    <section id="top" className="bg-white px-5 md:px-10">
      <div className="mx-auto max-w-shell pb-14 pt-8 md:pb-24 md:pt-16">
        {/*
          Three grid items, two layouts. On mobile they read title → photo →
          pitch, so the headline lands first and the CTA is not pushed a full
          photo-height down the page. From md up the photo moves into its own
          column beside both text blocks.
        */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,44%)] md:grid-rows-[auto_auto] md:items-center md:gap-x-14 md:gap-y-8">
          <motion.div
            className="flex min-w-0 flex-col gap-4 md:col-start-1 md:row-start-1 md:self-end"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep"
              variants={itemVariants}
            >
              {hero.eyebrow}
            </motion.p>

            <motion.h1
              className="font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-primary md:text-[2.9rem]"
              variants={itemVariants}
            >
              <span className="hero-title-highlight">Performance Marketing Manager</span>{' '}
              <span className="font-normal text-text">mit Schwerpunkt Leadgenerierung (m/w/d)</span>
            </motion.h1>

            <motion.div variants={itemVariants}>
              <JobInfoCard />
            </motion.div>
          </motion.div>

          {/* Fixed aspect so the photo is a deliberate shape at every width
              instead of whatever the file happens to be. */}
          <motion.div
            className="overflow-hidden rounded-[18px] bg-surface shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)] md:col-start-2 md:row-span-2 md:row-start-1"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={hero.photo}
              alt={hero.photoAlt}
              fallbackLabel="PPC Team"
              className="block aspect-[16/10] w-full object-cover object-center md:aspect-[4/3]"
              fallbackClassName="aspect-[16/10] md:aspect-[4/3]"
            />
          </motion.div>

          <motion.div
            className="flex min-w-0 flex-col gap-4 md:col-start-1 md:row-start-2 md:self-start"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <motion.p
              className="max-w-[54ch] text-[16px] leading-relaxed text-text/80"
              variants={itemVariants}
            >
              {hero.intro}
            </motion.p>

            <motion.div className="flex flex-col items-start gap-3.5" variants={itemVariants}>
              <p className="max-w-[46ch] text-[15px] font-semibold text-text">{hero.ctaLead}</p>
              <div data-hero-cta>
                <Button asChild size="lg" className="rounded-full">
                  <a href={QUIZ_LINK}>{CTA_LABEL}</a>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
