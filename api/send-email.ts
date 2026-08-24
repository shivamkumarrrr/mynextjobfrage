import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Candidate, FileAttachment, WebhookPayload } from '../src/lib/types';

const SMTP2GO_ENDPOINT = 'https://api.smtp2go.com/v3/email/send';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toAttachment(file: FileAttachment) {
  return { filename: file.filename, fileblob: file.data, mimetype: file.mimeType };
}

function buildEmail(payload: WebhookPayload, candidate: Candidate) {
  const rows: [string, string][] = [
    ['Name', candidate.name || '—'],
    ['E-Mail', candidate.email || '—'],
    ['Telefon', candidate.phone || '—'],
    ['Startdatum', candidate.startDate || '—'],
    ['Nachricht', candidate.message || '—'],
    ['Score', String(payload.scoring.total)],
    ['Tier', payload.scoring.tier?.label || '—'],
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
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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
  if (!payload || !payload.candidate) {
    res.status(200).json({ ok: true, skipped: 'no candidate' });
    return;
  }

  const { html, text, attachments } = buildEmail(payload, payload.candidate);

  const smtpRes = await fetch(SMTP2GO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': apiKey },
    body: JSON.stringify({
      api_key: apiKey,
      to: [recipient],
      sender,
      ...(payload.candidate.email ? { custom_headers: [{ header: 'Reply-To', value: payload.candidate.email }] } : {}),
      subject: `Neue Bewerbung: ${payload.candidate.name || 'Unbenannt'}`,
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
