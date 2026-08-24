import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QUIZ_LINK, finalCta } from './content';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FinalCta() {
  return (
    <section className="px-5 py-11 text-center md:px-10 md:py-14">
      <motion.div
        className="mx-auto max-w-[400px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <motion.h2
          className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl"
          variants={itemVariants}
        >
          {finalCta.heading}
        </motion.h2>
        <motion.div variants={itemVariants}>
          <Button asChild size="pill" className="mt-5 gap-1.5 px-7 py-3.5 text-[15px]">
            <a href={QUIZ_LINK}>{finalCta.label}</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
