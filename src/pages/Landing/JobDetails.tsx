import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from './SectionHeading';
import { jobDetails, sectionEyebrows } from './content';

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
    <section className="bg-bg px-5 py-16 md:px-10 md:py-24">
      {/* Narrower than the card grids above: these panels open into long prose,
          and a 1300px measure is unreadable. */}
      <div className="mx-auto max-w-[880px]">
        <SectionHeading eyebrow={sectionEyebrows.jobDetails} title="Alles zum Job" />

        <motion.div
          className="mt-10 flex flex-col gap-2.5"
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
