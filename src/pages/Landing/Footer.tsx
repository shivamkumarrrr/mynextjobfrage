import { motion } from 'framer-motion';
import { company } from './content';

const LINKEDIN_URL = 'https://www.linkedin.com/company/ppc-gmbh/posts/';
const LINKEDIN_PATH =
  'M4.98 3.5a2 2 0 1 1-.02 4 2 2 0 0 1 .02-4zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z';

export function Footer() {
  return (
    <footer className="bg-primary px-5 py-10 text-center md:p-12">
      <motion.div
        className="mx-auto max-w-page"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-sm font-bold text-white">{company.name}</p>
        <p className="mt-1.5 text-[13px] leading-normal text-white/45">{company.address}</p>
        <p className="text-[13px] leading-normal text-white/45">{company.phone}</p>

        <a
          className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60 transition-colors duration-200 hover:bg-accent hover:text-white"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="PPC GmbH auf LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path d={LINKEDIN_PATH} fill="currentColor" />
          </svg>
        </a>

        <div className="mx-auto mt-6 flex max-w-[200px] items-center justify-center gap-3 border-t border-white/10 pt-5">
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="/impressum"
          >
            Impressum
          </a>
          <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-white/25" aria-hidden="true" />
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="/datenschutz"
          >
            Datenschutz
          </a>
        </div>
      </motion.div>
    </footer>
  );
}
