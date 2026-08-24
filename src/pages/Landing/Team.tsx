import { motion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { team } from './content';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Team() {
  return (
    <section className="px-5 md:px-10">
      <motion.div
        className="mx-auto max-w-[800px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <motion.div
          className="overflow-hidden rounded-brand bg-primary"
          variants={itemVariants}
        >
          <ImageWithFallback
            src={team.photo}
            alt={team.alt}
            fallbackLabel="PPC Team"
            className="block aspect-[16/9] w-full object-cover"
            fallbackClassName="aspect-[16/9]"
          />
        </motion.div>
        <motion.p
          className="mt-3 text-center text-sm font-medium text-muted uppercase"
          variants={itemVariants}
        >
          {team.caption}
        </motion.p>
      </motion.div>
    </section>
  );
}
