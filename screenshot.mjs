import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const BASE = 'http://localhost:3000';
const OUT = 'docs/screenshots';

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log('  BROWSER:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('  PAGE ERROR:', err.message));

async function shot(name, viewport) {
  await page.setViewport(viewport);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  ✓ ${name}`);
}

async function clickAnswer(idx = 1) {
  const answers = await page.$$('[data-answer]');
  if (answers.length > idx) await answers[idx].click();
  await new Promise(r => setTimeout(r, 600));
}

async function clickMultiNext() {
  const btn = await page.$('[data-multi-next]:not([disabled])');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 600));
}

async function typeTextAnswer(text) {
  const input = await page.$('[data-text-answer]');
  if (input) await input.type(text);
  await new Promise(r => setTimeout(r, 200));
  const btn = await page.$('[data-text-next]:not([disabled])');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 600));
}

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 900 };

// === MOBILE ===
console.log('\n--- MOBILE ---');

// 1. Landing page
await page.goto(`${BASE}/landing.html`, { waitUntil: 'networkidle0' });
await shot('01-landing-mobile', MOBILE);

// 2. Quiz welcome
const quizUrl = `${BASE}/?q=ppc-performance-marketing`;
console.log('  Navigating to:', quizUrl);
await page.goto(quizUrl, { waitUntil: 'networkidle0' });
console.log('  Current URL:', page.url());
await new Promise(r => setTimeout(r, 2000));
const bodyText = await page.$eval('body', el => el.innerText.substring(0, 500));
console.log('  Page text:', bodyText.replace(/\n/g, ' | '));
const startBtnMobile = await page.$('[data-start]');
console.log('  [data-start] found:', !!startBtnMobile);
await shot('02-quiz-welcome-mobile', MOBILE);

// 3. Click start
const startBtn = await page.$('[data-start]');
if (startBtn) {
  await startBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await shot('03-question-1-mobile', MOBILE);

  // 4. Answer Q1 → Q2
  await clickAnswer(1);
  await shot('04-question-2-mobile', MOBILE);

  // 5. Answer Q2 → Q3
  await clickAnswer(2);
  await shot('05-question-3-mobile', MOBILE);

  // 6. Fast-forward through remaining questions
  for (let i = 3; i < 16; i++) {
    const multiBtn = await page.$('[data-multi-next]');
    if (multiBtn) {
      await clickAnswer(0);
      await clickMultiNext();
      continue;
    }
    const textNext = await page.$('[data-text-next]');
    if (textNext) {
      await typeTextAnswer('Saarbrücken');
      continue;
    }
    const ans = await page.$$('[data-answer]');
    if (ans.length > 0) await clickAnswer(Math.min(2, ans.length - 1));
  }

  await new Promise(r => setTimeout(r, 600));

  // 7. Capture final screen
  const screenHtml = await page.$eval('#screen', el => el.innerHTML);
  if (screenHtml.includes('lead-form')) {
    await shot('06-lead-form-mobile', MOBILE);
  } else if (screenHtml.includes('rejection')) {
    await shot('06-rejection-mobile', MOBILE);
  } else {
    await shot('06-final-screen-mobile', MOBILE);
  }
}

// === DESKTOP ===
console.log('\n--- DESKTOP ---');

// 8. Landing page desktop
await page.goto(`${BASE}/landing.html`, { waitUntil: 'networkidle0' });
await shot('07-landing-desktop', DESKTOP);

// 9. Quiz welcome desktop
await page.goto(`${BASE}/?q=ppc-performance-marketing`, { waitUntil: 'networkidle0' });
await shot('08-quiz-welcome-desktop', DESKTOP);

// 10. Quiz question desktop
const startBtn2 = await page.$('[data-start]');
if (startBtn2) {
  await startBtn2.click();
  await new Promise(r => setTimeout(r, 600));
  await shot('09-question-desktop', DESKTOP);
}

await browser.close();
console.log('\nDone!');
