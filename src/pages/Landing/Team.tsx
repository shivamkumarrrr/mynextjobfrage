import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Reveal } from '@/components/Reveal';
import { team } from './content';

export function Team() {
  return (
    <section className="px-5 md:px-10">
      <Reveal className="mx-auto max-w-[800px]">
        <div className="overflow-hidden rounded-brand bg-primary">
          <ImageWithFallback
            src={team.photo}
            alt={team.alt}
            fallbackLabel="PPC Team"
            className="block aspect-[16/9] w-full object-cover"
            fallbackClassName="aspect-[16/9]"
          />
        </div>
        <p className="mt-3 text-center text-sm font-medium text-muted uppercase">{team.caption}</p>
      </Reveal>
    </section>
  );
}
