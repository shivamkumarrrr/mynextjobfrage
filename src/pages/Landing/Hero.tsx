import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { JobInfoCard } from './JobInfoCard';
import { QUIZ_LINK, company, hero } from './content';

export function Hero() {
  return (
    <section className="bg-white">
      <div className="hero-grid mx-auto grid max-w-page gap-4 px-5 py-7 md:max-w-[1100px] md:items-center md:gap-x-12 md:gap-y-3 md:px-10 md:py-12">
        <img className="area-logo max-h-10 w-auto" src={company.logo} alt={company.name} />
        <p className="area-tagline -mt-2 text-xs font-semibold tracking-[0.3px] text-muted">
          {company.tagline}
        </p>
        <h1 className="area-title font-display text-2xl font-extrabold leading-tight tracking-[-0.2px] text-primary md:text-[2rem]">
          {hero.title}
        </h1>

        <JobInfoCard />

        <div className="area-photo -mx-5 overflow-hidden bg-primary md:mx-0 md:self-stretch md:rounded-brand">
          <ImageWithFallback
            src={hero.photo}
            alt={hero.photoAlt}
            fallbackLabel="PPC Team"
            className="block aspect-[16/10] h-full w-full object-cover object-[center_20%] md:aspect-auto"
            fallbackClassName="aspect-[16/10] md:aspect-auto md:h-full"
          />
        </div>

        <p className="area-intro text-[15px] text-muted">{hero.intro}</p>
        <p className="area-ctalead text-[15px] font-bold text-text">{hero.ctaLead}</p>
        <Button asChild size="pill" className="area-cta justify-self-start gap-1.5 text-sm">
          <a href={QUIZ_LINK}>{hero.ctaLabel}</a>
        </Button>
      </div>
    </section>
  );
}
