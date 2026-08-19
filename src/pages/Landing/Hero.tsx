import { motion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { JobInfoCard } from './JobInfoCard';
import { QUIZ_LINK, company, hero } from './content';

export function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1100px] px-5 pt-4 pb-10 md:px-10 md:pt-5 md:pb-14">
        {/* Logo centered at top */}
        <div className="mb-10 flex flex-col items-center md:mb-12">
          <img src={company.logo} alt={company.name} className="h-10 w-auto md:h-12" />
          <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.3px] text-muted">
            {company.tagline}
          </p>
        </div>

        {/* Two columns — photo left, content right */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6">
          {/* Photo — full team, nothing cut */}
          <div className="overflow-hidden rounded-brand md:w-[48%] md:shrink-0">
            <ImageWithFallback
              src={hero.photo}
              alt={hero.photoAlt}
              fallbackLabel="PPC Team"
              className="block w-full h-auto"
              fallbackClassName="w-full h-auto"
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:pl-8">
            <motion.h1
              className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.02em] text-primary md:text-[2.25rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="hero-title-highlight font-bold">Performance Marketing Manager</span>{' '}
              <span className="font-normal">mit Schwerpunkt Leadgenerierung (m/w/d) gesucht</span>
            </motion.h1>

            <JobInfoCard />

            <p className="text-[15px] leading-relaxed text-muted">{hero.intro}</p>

            <p className="text-[15px] font-bold text-text">{hero.ctaLead}</p>

            <div>
              <Button asChild size="pill" className="gap-1.5 text-sm">
                <a href={QUIZ_LINK}>{hero.ctaLabel}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
