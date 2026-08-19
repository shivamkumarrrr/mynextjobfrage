import { Benefits } from './Benefits';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { JobDetails } from './JobDetails';
import { ProcessSteps } from './ProcessSteps';
import { StickyMobileCta } from './StickyMobileCta';
import { Team } from './Team';

/**
 * The job ad itself. Its CTAs navigate to the quiz as a full page
 * (`app?q=…`) rather than embedding it — same pattern as the live site.
 */
export function LandingPage() {
  return (
    <>
      <Hero />
      <Benefits />
      <ProcessSteps />
      <JobDetails />
      <Team />
      <FinalCta />
      <Footer />
      <StickyMobileCta />
    </>
  );
}
