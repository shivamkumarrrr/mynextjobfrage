import { motion, MotionConfig } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { JobInfoCard } from './JobInfoCard';
import { QUIZ_LINK, company, hero } from './content';

const contentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
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
    <section className="bg-white">
      <div className="mx-auto max-w-[1100px] px-5 pt-4 pb-10 md:px-10 md:pt-5 md:pb-14">
        {/* Logo centered at top */}
        <motion.div
          className="mb-10 flex flex-col items-center md:mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={company.logo} alt={company.name} className="h-10 w-auto md:h-12" />
          <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.3px] text-muted">
            {company.tagline}
          </p>
        </motion.div>

        {/* Two columns — photo left, content right */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6">
          {/* Photo — full team, nothing cut */}
          <motion.div
            className="overflow-hidden rounded-brand md:w-[48%] md:shrink-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWithFallback
              src={hero.photo}
              alt={hero.photoAlt}
              fallbackLabel="PPC Team"
              className="block w-full h-auto"
              fallbackClassName="w-full h-auto"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            className="flex min-w-0 flex-1 flex-col gap-4 md:pl-8"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <motion.h1
              className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.02em] text-primary md:text-[2.25rem]"
              variants={itemVariants}
            >
              <span className="hero-title-highlight font-bold">Performance Marketing Manager</span>{' '}
              <span className="font-normal">mit Schwerpunkt Leadgenerierung (m/w/d) gesucht</span>
            </motion.h1>

            <motion.div variants={itemVariants}>
              <JobInfoCard />
            </motion.div>

            <motion.p className="text-[15px] leading-relaxed text-muted" variants={itemVariants}>
              {hero.intro}
            </motion.p>

            <motion.p className="text-[15px] font-bold text-text" variants={itemVariants}>
              {hero.ctaLead}
            </motion.p>

            <motion.div variants={itemVariants}>
              <MotionConfig reducedMotion="user">
                <motion.div
                  className="inline-block rounded-full"
                  animate={{
                    scale: [1, 1.04, 1],
                    boxShadow: [
                      '0 0 0 0 color-mix(in srgb, var(--accent) 35%, transparent)',
                      '0 0 0 8px color-mix(in srgb, var(--accent) 0%, transparent)',
                      '0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent)',
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <Button asChild size="pill" className="gap-1.5 text-sm">
                    <a href={QUIZ_LINK}>{hero.ctaLabel}</a>
                  </Button>
                </motion.div>
              </MotionConfig>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
