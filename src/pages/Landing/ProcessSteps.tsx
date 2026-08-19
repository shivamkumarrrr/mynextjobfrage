import { motion, MotionConfig } from 'framer-motion';
import { processHeading, processSteps } from './content';
import { processStepIcons } from './icons';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
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

export function ProcessSteps() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-[color-mix(in_srgb,var(--accent)_5%,white)] px-5 pt-16 pb-12 md:px-10 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-shell">
          <motion.h2
            className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {processHeading}
          </motion.h2>

          <div className="relative mt-12">
            {/* Desktop: equal-width columns with arrows */}
            <motion.div
              className="hidden flex-col gap-8 md:flex md:flex-row md:items-stretch"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={containerVariants}
            >
              {processSteps.map((step, idx) => (
                <div key={step.number} className="relative flex w-1/3 flex-col items-center">
                  <motion.div
                    className="group relative flex flex-col items-center gap-3 text-center"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                      {processStepIcons[step.icon]}
                    </div>
                    <p className="text-[15px] font-medium text-text">{step.title}</p>
                    <p className="text-[14px] leading-relaxed text-muted">{step.body}</p>
                  </motion.div>
                  {idx < processSteps.length - 1 && (
                    <div className="absolute -right-6 top-5 text-2xl font-bold text-accent">
                      →
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Mobile: stacked */}
            <motion.div
              className="flex flex-col gap-8 md:hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={containerVariants}
            >
              {processSteps.map((step) => (
                <motion.div
                  key={step.number}
                  className="group relative flex flex-col gap-3"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                    {processStepIcons[step.icon]}
                  </div>
                  <p className="text-[15px] font-medium text-text">{step.title}</p>
                  <p className="text-[14px] leading-relaxed text-muted">{step.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
