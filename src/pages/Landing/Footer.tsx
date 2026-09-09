import { motion } from 'framer-motion';
import { company } from './content';

const LINKEDIN_URL = 'https://www.linkedin.com/company/ppc-gmbh/posts/';
const LINKEDIN_PATH =
  'M4.98 3.5a2 2 0 1 1-.02 4 2 2 0 0 1 .02-4zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z';

const linkClass =
  'text-[13px] text-white/75 no-underline underline-offset-4 transition-colors hover:text-white hover:underline';

export function Footer() {
  return (
    <footer className="bg-primary px-5 pb-24 pt-14 md:px-10 md:pb-14 md:pt-16">
      <motion.div
        className="mx-auto max-w-shell"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Columns rather than one centred stack: an imprint reads as a company
            record, and the legal links need a home of their own. */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <img src={company.logo} alt={company.name} className="h-7 w-auto brightness-0 invert" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {company.tagline}
            </p>
          </div>

          <address className="not-italic">
            <p className="text-[13px] font-bold text-white">{company.name}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{company.address}</p>
            {/* Tappable on a phone — this is a recruiting page, calling is a real path. */}
            <a className={linkClass} href={`tel:${company.phoneHref}`}>
              {company.phone}
            </a>
          </address>

          <nav className="flex flex-col items-start gap-2.5" aria-label="Rechtliches">
            <a className={linkClass} href="/impressum">
              Impressum
            </a>
            <a className={linkClass} href="/datenschutz">
              Datenschutz
            </a>
            <a
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors duration-200 hover:bg-accent hover:text-white"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PPC GmbH auf LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path d={LINKEDIN_PATH} fill="currentColor" />
              </svg>
            </a>
          </nav>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-[12px] text-white/50">
          © {new Date().getFullYear()} {company.name}
        </p>
      </motion.div>
    </footer>
  );
}
