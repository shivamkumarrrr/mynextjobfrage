import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Candidate, FileAttachment, WebhookPayload } from '../src/lib/types';

const SMTP2GO_ENDPOINT = 'https://api.smtp2go.com/v3/email/send';

// Client-side (Lead.tsx) enforces the same limits, but that's just UX — an
// attacker can call this endpoint directly with any body, so the caps have to
// be re-checked here to actually bound what we forward (and pay SMTP2GO for).
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 6; // 1 CV + up to 5 certificates
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Email headers (Subject, Reply-To) break if a value carries a raw CR/LF —
 * that's the classic email-header-injection primitive, letting a crafted
 * candidate name/email add arbitrary extra headers (e.g. Bcc). Every value
 * that lands in a header, not just the body, goes through this first.
 */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function toAttachment(file: FileAttachment) {
  return { filename: file.filename, fileblob: file.data, mimetype: file.mimeType };
}

/** Rejects the whole request if attachments are missing fields, miscounted, or oversized. */
function validateAttachments(candidate: Candidate): string | null {
  const files = [...(candidate.cv ? [candidate.cv] : []), ...(candidate.certificates || [])];
  if (files.length > MAX_ATTACHMENT_COUNT) return 'Too many attachments';

  let total = 0;
  for (const f of files) {
    if (!isNonEmptyString(f?.filename) || !isNonEmptyString(f?.data) || !isNonEmptyString(f?.mimeType)) {
      return 'Malformed attachment';
    }
    if (typeof f.sizeBytes !== 'number' || f.sizeBytes > MAX_ATTACHMENT_BYTES) {
      return 'Attachment too large';
    }
    total += f.sizeBytes;
  }
  if (total > MAX_TOTAL_ATTACHMENT_BYTES) return 'Attachments too large';
  return null;
}

function buildEmail(payload: WebhookPayload, candidate: Candidate) {
  const rows: [string, string][] = [
    ['Name', candidate.name || '—'],
    ['E-Mail', candidate.email || '—'],
    ['Telefon', candidate.phone || '—'],
    ['Startdatum', candidate.startDate || '—'],
    ['Nachricht', candidate.message || '—'],
    ['Score', String(payload.scoring?.total ?? '—')],
    ['Tier', payload.scoring?.tier?.label || '—'],
    ['Quiz', payload.quizId || '—'],
  ];

  const html =
    `<h2>Neue Bewerbung${candidate.name ? `: ${escapeHtml(candidate.name)}` : ''}</h2>` +
    '<table cellpadding="4">' +
    rows
      .map(
        ([label, value]) =>
          `<tr><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(value)}</td></tr>`
      )
      .join('') +
    '</table>';

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  const attachments = [
    ...(candidate.cv ? [toAttachment(candidate.cv)] : []),
    ...(candidate.certificates || []).map(toAttachment),
  ];

  return { html, text, attachments };
}

/**
 * Receives the same WebhookPayload the quiz already POSTs to `config.webhook.url`
 * (see src/lib/webhook.ts — that payload shape is a fixed integration contract
 * and isn't touched here) and relays it to SMTP2GO's send API. The API key never
 * reaches the browser: it only exists as a Vercel environment variable, read
 * server-side in this function.
 *
 * Rejected candidates (`candidate: null`) still hit this endpoint, since the
 * quiz fires its webhook unconditionally — but there's no one to email, so
 * those are acknowledged (200) without calling SMTP2GO, instead of paging the
 * recruiter inbox for every knockout.
 *
 * This endpoint is unauthenticated by necessity (it's called from the
 * candidate's own browser, which can't hold a secret) — the same-origin check
 * below is a mitigation, not proof of authenticity: a determined caller can
 * still spoof Origin. It stops casual/drive-by abuse, not a targeted attacker.
 * Real hardening would mean CAPTCHA or a signed per-session token, which is
 * more than this stage of the project needs.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host && new URL(origin).host !== host) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const apiKey = process.env.SMTP2GO_API_KEY;
  const sender = process.env.SMTP2GO_SENDER;
  const recipient = process.env.SMTP2GO_RECIPIENT;

  if (!apiKey || !sender || !recipient) {
    console.error('[send-email] missing SMTP2GO_API_KEY / SMTP2GO_SENDER / SMTP2GO_RECIPIENT');
    res.status(500).json({ error: 'Email delivery not configured' });
    return;
  }

  const payload = req.body as WebhookPayload;
  if (!payload || typeof payload !== 'object' || !payload.candidate) {
    res.status(200).json({ ok: true, skipped: 'no candidate' });
    return;
  }

  const candidate = payload.candidate;
  if (!isNonEmptyString(candidate.name) && !isNonEmptyString(candidate.email)) {
    res.status(400).json({ error: 'Invalid candidate' });
    return;
  }

  const attachmentError = validateAttachments(candidate);
  if (attachmentError) {
    res.status(400).json({ error: attachmentError });
    return;
  }

  const { html, text, attachments } = buildEmail(payload, candidate);
  const safeName = sanitizeHeaderValue(candidate.name || 'Unbenannt');
  const replyTo = isNonEmptyString(candidate.email) ? sanitizeHeaderValue(candidate.email) : null;

  const smtpRes = await fetch(SMTP2GO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': apiKey },
    body: JSON.stringify({
      api_key: apiKey,
      to: [recipient],
      sender,
      ...(replyTo ? { custom_headers: [{ header: 'Reply-To', value: replyTo }] } : {}),
      subject: `Neue Bewerbung: ${safeName}`,
      html_body: html,
      text_body: text,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!smtpRes.ok) {
    const detail = await smtpRes.text();
    console.error('[send-email] SMTP2GO error', smtpRes.status, detail);
    res.status(502).json({ error: 'Email delivery failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
