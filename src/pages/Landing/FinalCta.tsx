import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { QUIZ_LINK, finalCta } from './content';

export function FinalCta() {
  return (
    <section className="px-5 py-11 text-center md:px-10 md:py-14">
      <Reveal className="mx-auto max-w-[400px]">
        <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-primary md:text-3xl">
          {finalCta.heading}
        </h2>
        <Button asChild size="pill" className="mt-5 gap-1.5 px-7 py-3.5 text-[15px]">
          <a href={QUIZ_LINK}>{finalCta.label}</a>
        </Button>
      </Reveal>
    </section>
  );
}
