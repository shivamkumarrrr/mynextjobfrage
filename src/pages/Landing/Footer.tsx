import { company } from './content';

const LINKEDIN_URL = 'https://www.linkedin.com/company/ppc-gmbh/posts/';
const LINKEDIN_PATH =
  'M4.98 3.5a2 2 0 1 1-.02 4 2 2 0 0 1 .02-4zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z';

export function Footer() {
  return (
    <footer className="bg-primary px-5 py-8 text-center md:p-10">
      <div className="mx-auto max-w-page">
        <p className="text-sm font-bold text-white">{company.name}</p>
        <p className="mt-1 text-[13px] leading-normal text-white/45">{company.address}</p>
        <p className="text-[13px] leading-normal text-white/45">{company.phone}</p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="/impressum"
          >
            Impressum
          </a>
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="/datenschutz"
          >
            Datenschutz
          </a>
          <a
            className="text-white/50 transition-colors hover:text-white"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PPC GmbH auf LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
              <path d={LINKEDIN_PATH} fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
