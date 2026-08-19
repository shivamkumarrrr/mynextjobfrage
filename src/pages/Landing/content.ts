/**
 * All landing-page copy for this client, in one place.
 * Deep link to the quiz: extensionless on purpose — `app.html?q=…` is
 * 301-redirected by the host's clean-URL handling, which drops the query string.
 */
export const QUIZ_LINK = 'app?q=ppc-performance-marketing';

export const company = {
  name: 'PPC GmbH',
  tagline: 'Palz Performance Consulting',
  logo: 'assets/ppc-logo.png',
  address: 'Viktoriastr. 19 · 66111 Saarbrücken',
  phone: 'Tel: 0681 – 410 968 40',
};

export const hero = {
  title: 'Performance Marketing Manager mit Schwerpunkt Leadgenerierung (m/w/d) gesucht',
  photo: 'assets/PPC-team-walking.jpg',
  photoAlt: 'PPC GmbH Team',
  intro:
    'Du kannst dir vorstellen in einer Performance Marketing Agentur zu arbeiten und hast Lust dich und deine Expertise im Bereich Leadgen in spannenden Projekten einzubringen und stetig weiterzuentwickeln?',
  ctaLead:
    'Mache jetzt unseren kurzen Online Bewerber-Test und finde heraus, ob du zu uns und wir zu dir passen:',
  ctaLabel: "Hier geht's zum TEST",
};

export const jobInfo = {
  location: 'Saarbrücken',
  remote: 'Homeoffice möglich',
  hours: '32–40 h pro Woche',
};
export const benefits: string[] = [
  'Überdurchschnittlich gute Bezahlung & attraktive Prämien',
  'Spannende Projekte im Bereich Leadgenerierung und E-Commerce',
  'Zuschüsse zur betrieblichen Vorsorge, Kranken- & BU-Versicherung',
  'Unbefristeter Arbeitsvertrag und 33 Tage Urlaub',
  'Weiterentwicklung eigener Startups',
  'Job Bike sowie weitere Mitarbeiter-Benefits',
  'Remote Office: Ortsunabhängiges & flexibles Arbeiten',
  'Gute Weiterbildungsmöglichkeiten durch Seminare und Coachings',
  'Gute Aufstiegsmöglichkeiten',
];

export const jobDetails = [
  {
    id: 'unternehmen',
    title: 'Dein neues Unternehmen',
    body: 'Wir, das Team der PPC GmbH haben uns ganz dem Performance-Marketing verschrieben. Mit Leidenschaft betreuen wir eine Vielzahl an großen, internationalen Kunden sowie KMUs und Startups. Wir suchen jemanden, der unsere Leidenschaft teilt und den Erfolg unserer Kunden positiv beeinflussen will und kann!',
  },
  {
    id: 'arbeitsort',
    title: 'Dein Arbeitsort',
    body: 'Unser Büro befindet sich im Herzen Saarbrückens. Arbeiten kannst du auch gerne vom Mond. Hauptsache dein WLAN funktioniert.',
  },
  {
    id: 'kollegen',
    title: 'Deine Arbeitskollegen',
    body: 'Dein neues Team bietet dir eine offene Arbeitsatmosphäre zum Wohlfühlen. Wir zeichnen uns besonders durch flache Hierarchien in einem jungen, offenen Team und regelmäßigen Afterwork-Events aus.',
  },
  {
    id: 'aufgaben',
    title: 'Deine Aufgaben',
    body: 'Du setzt Performance-Marketing-Kampagnen im Bereich Leadgenerierung und E-Commerce eigenständig um. Dabei sorgst du dafür, dass die Budgets effizient eingesetzt und der Kampagnenerfolg in Form von Leads und Onlineumsatz maximiert werden. Du achtest stets auf die Einhaltung der ROAs- und CPA-Vorgaben. Du baust geeignete Kampagnenstrukturen in den Kanälen Google Ads und Meta Ads auf und optimierst Landingpages und Customer Journeys. Du bist verantwortlich für die Betreuung und Weiterentwicklung unserer Kunden.',
  },
  {
    id: 'qualifizierung',
    title: 'Deine Qualifizierung',
    body: 'Du besitzt mehrjährige Erfahrung (min. 3 Jahre) im Bereich Performance Marketing (Google Ads, Bing Ads, Paid Social), bevorzugt im Agenturumfeld. Darüber hinaus solltest du dich mit Leadgenerierung gut auskennen. Erfahrungen in der Konzeption und Erstellung von Leadfunneln sind von Vorteil. Uns ist wichtig, dass du über eine strukturierte und selbstständige Arbeitsweise verfügst und hohe Ansprüche an die Qualität deiner Arbeit stellst.',
  },
  {
    id: 'gehalt',
    title: 'Dein Gehalt',
    body: 'Überdurchschnittlich gute Bezahlung und attraktive Prämien – wir haben klare Ziele. Du auch? Wir belohnen dich für persönliche und unternehmerische Erfolge. Zudem erhältst du über unser Startup nexuro Zuschüsse zur betrieblichen Altersvorsorge, Krankenversicherung, Berufsunfähigkeitsversicherung, Sachbezüge, Jobbike sowie weitere Mitarbeiter-Benefits.',
  },
  {
    id: 'vorteile',
    title: 'Deine Vorteile',
    body: 'Du arbeitest an spannenden Projekten in einem offenen Team, welches sein Wissen gerne mit dir teilt. Neben 33 Tagen Urlaub erhältst du modernste Arbeitsausstattung, die es dir ermöglicht, sowohl vor Ort als auch remote an deinen Projekten zu arbeiten. Bei uns hast du die Möglichkeit, deine eigenen Ideen mit einzubringen und deinen Aufgabenbereich an deine Interessen und Stärken anzupassen. Wir bieten dir umfangreiche Weiterbildungsmöglichkeiten, um deine eigene Weiterentwicklung so gut es geht zu unterstützen.',
  },
];

export const team = {
  photo: 'assets/PPC-team-sitting.jpg',
  alt: 'Das PPC-Team',
  caption: 'Performance outside the office',
};

export const finalCta = {
  heading: 'Finde heraus, ob wir zusammenpassen',
  label: '→ Jetzt Online-Test starten',
};

export const processHeading = 'Dein Weg zu uns';

export const processSteps: {
  number: string;
  title: string;
  body: string;
  icon: 'clipboard' | 'contact' | 'rocket';
}[] = [
  {
    number: '01',
    title: 'Nimm an unserem Test teil',
    body: 'Kurzer Test, ca. 3 Minuten – zeig uns, was du kannst.',
    icon: 'clipboard',
  },
  {
    number: '02',
    title: 'Kontaktdaten hinterlassen',
    body: 'Wenn du zu unserem Anforderungsprofil passt, kannst du uns deine Kontaktdaten hinterlassen und wir melden uns bei dir.',
    icon: 'contact',
  },
  {
    number: '03',
    title: 'Gespräch & Start',
    body: 'Wenn alles passt, kannst du nach einem erfolgreichen Gespräch online oder bei uns im Haus… sofort bei uns im Team anfangen.',
    icon: 'rocket',
  },
];
