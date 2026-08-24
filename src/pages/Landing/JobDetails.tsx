import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { jobDetails } from './content';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

/** "Alles zum Job" — shadcn/Radix accordion in place of the hand-rolled one. */
export function JobDetails() {
  return (
    <section className="px-5 pb-12 md:px-10 md:pb-14">
      <div className="mx-auto max-w-shell">
        <motion.h2
          className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Alles zum Job
        </motion.h2>
        <motion.div
          className="mt-6 flex flex-col gap-2.5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-2.5">
            {jobDetails.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <AccordionItem value={item.id}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>{item.body}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
