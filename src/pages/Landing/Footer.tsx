import { company } from './content';

export function Footer() {
  return (
    <footer className="bg-primary px-5 py-8 text-center md:p-10">
      <div className="mx-auto max-w-page">
        <p className="text-sm font-bold text-white">{company.name}</p>
        <p className="mt-1 text-[13px] leading-normal text-white/45">{company.address}</p>
        <p className="text-[13px] leading-normal text-white/45">{company.phone}</p>
        <div className="mt-4 flex justify-center gap-6">
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="#"
          >
            Impressum
          </a>
          <a
            className="text-xs font-medium tracking-[0.2px] text-white/50 no-underline transition-colors hover:text-white"
            href="#"
          >
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
