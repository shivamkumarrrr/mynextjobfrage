import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { QUIZ_LINK, finalCta } from './content';

export function FinalCta() {
  return (
    <section className="px-5 py-11 text-center md:px-10 md:py-14">
      <Reveal className="mx-auto max-w-[400px]">
        <h2 className="mt-1.5 font-display text-[1.2rem] font-extrabold tracking-[-0.2px] text-primary">
          {finalCta.heading}
        </h2>
        <Button asChild size="pill" className="mt-5 gap-1.5 px-7 py-3.5 text-[15px]">
          <a href={QUIZ_LINK}>{finalCta.label}</a>
        </Button>
      </Reveal>
    </section>
  );
}
