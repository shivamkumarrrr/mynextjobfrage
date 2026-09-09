import { motion } from 'framer-motion';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Centres the block — used by the closing sections. */
  align?: 'left' | 'center';
}

/**
 * One heading treatment for every section. Before this each section invented its
 * own size and spacing, which is what made the page read as a stack of unrelated
 * blocks rather than one document.
 */
export function SectionHeading({ eyebrow, title, align = 'left' }: SectionHeadingProps) {
  return (
    <motion.div
      className={align === 'center' ? 'text-center' : ''}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep">
        {eyebrow}
      </p>
      <h2 className="mt-2.5 font-display text-[1.75rem] font-bold leading-[1.15] tracking-[-0.03em] text-primary md:text-[2.125rem]">
        {title}
      </h2>
    </motion.div>
  );
}
