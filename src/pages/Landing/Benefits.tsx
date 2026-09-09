import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { benefits, benefitsHeading, sectionEyebrows } from './content';
import { benefitIcons } from './icons';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Benefits() {
  return (
    <section className="bg-[color-mix(in_srgb,var(--accent)_5%,white)] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-shell">
        <SectionHeading eyebrow={sectionEyebrows.benefits} title={benefitsHeading} />

        <motion.ul
          className="mt-10 grid list-none grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {benefits.map((benefit) => (
            <motion.li
              key={benefit.title}
              className="group relative flex items-start gap-4 overflow-hidden rounded-brand border border-border bg-white p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] sm:flex-col sm:gap-3 sm:p-5"
              variants={itemVariants}
            >
              {/* Accent hairline that fills in on hover — keeps the resting card calm. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] sm:h-11 sm:w-11 sm:rounded-[14px] bg-[color-mix(in_srgb,var(--accent)_12%,white)] text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                {benefitIcons[benefit.icon]}
              </span>
              <div className="min-w-0">
                <p className="font-display text-[16px] font-bold leading-snug tracking-[-0.01em] text-primary sm:text-[17px]">
                  {benefit.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-text/75 sm:mt-3 sm:text-[14.5px]">
                  {benefit.body}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
