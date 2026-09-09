import { motion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SectionHeading } from './SectionHeading';
import { sectionEyebrows, team } from './content';

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
    <section className="bg-white px-5 py-16 md:px-10 md:py-24">
      <motion.div
        className="mx-auto max-w-[880px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
      >
        <SectionHeading eyebrow={sectionEyebrows.team} title={team.heading} align="center" />

        <motion.figure className="mt-10" variants={itemVariants}>
          <div className="overflow-hidden rounded-[18px] bg-primary shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)]">
            <ImageWithFallback
              src={team.photo}
              alt={team.alt}
              fallbackLabel="PPC Team"
              loading="lazy"
              className="block aspect-[16/9] w-full object-cover"
              fallbackClassName="aspect-[16/9]"
            />
          </div>
          <figcaption className="mt-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-text/60">
            {team.caption}
          </figcaption>
        </motion.figure>
      </motion.div>
    </section>
  );
}
