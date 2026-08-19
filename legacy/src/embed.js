/**
 * iframe embedding helper.
 *
 * Sends `{ type: 'quiz-resize', height }` to the parent frame on every
 * screen change and window resize, keeping the embed height in sync.
 *
 * Parent page listens with:
 *   window.addEventListener('message', (e) => {
 *     if (e.data?.type === 'quiz-resize')
 *       document.getElementById('embed').style.height = e.data.height + 'px';
 *   });
 */
export function initEmbed() {
  let inIframe = false;
  try {
    inIframe = window.self !== window.top;
  } catch (_) {
    inIframe = true;
  }

  const send = () => {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    try {
      window.parent.postMessage({ type: 'quiz-resize', height }, '*');
    } catch (_) {
      /* noop */
    }
  };

  if (!inIframe) return send;

  const mo = new MutationObserver(() => send());
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  window.addEventListener('resize', () => send(), { passive: true });

  // Re-sync shortly after fonts/images settle.
  setTimeout(send, 150);
  setTimeout(send, 600);
  send();
  return send;
}
