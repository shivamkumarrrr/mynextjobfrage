import { MotionConfig } from 'framer-motion';
import { Benefits } from './Benefits';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { JobDetails } from './JobDetails';
import { ProcessSteps } from './ProcessSteps';
import { SiteHeader } from './SiteHeader';
import { StickyMobileCta } from './StickyMobileCta';
import { Team } from './Team';

/**
 * The job ad itself. Its CTAs navigate to the quiz as a full page
 * (`app?q=…`) rather than embedding it — same pattern as the live site.
 *
 * `reducedMotion="user"` is page-level on purpose: every section animates, so
 * honouring the OS setting has to be a property of the page, not something each
 * component remembers to opt into.
 */
export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <Hero />
      <Benefits />
      <ProcessSteps />
      <JobDetails />
      <Team />
      <FinalCta />
      <Footer />
      <StickyMobileCta />
    </MotionConfig>
  );
}
