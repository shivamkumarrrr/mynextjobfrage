import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { jobDetails } from './content';

/** "Alles zum Job" — shadcn/Radix accordion in place of the hand-rolled one. */
export function JobDetails() {
  return (
    <section className="px-5 pb-12 md:px-10 md:pb-14">
      <div className="mx-auto max-w-page">
        <h2 className="mt-1.5 font-display text-[1.35rem] font-extrabold tracking-[-0.2px] text-primary">
          Alles zum Job
        </h2>
        <Accordion type="single" collapsible className="mt-6 flex flex-col gap-2.5">
          {jobDetails.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
