/**
 * iframe embedding helper.
 *
 * Sends `{ type: 'quiz-resize', height }` to the parent frame on every screen
 * change and window resize, keeping the embed height in sync.
 *
 * Parent page listens with:
 *   window.addEventListener('message', (e) => {
 *     if (e.data?.type === 'quiz-resize')
 *       document.getElementById('embed').style.height = e.data.height + 'px';
 *   });
 */
export function initEmbed(): () => void {
  // A cross-origin parent throws on `window.top`, which itself means embedded.
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const send = () => {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    try {
      window.parent.postMessage({ type: 'quiz-resize', height }, '*');
    } catch {
      /* noop */
    }
  };

  if (!inIframe) return send;

  // A MutationObserver on the whole document fires per mutation record; React
  // rendering a screen produces dozens at once. Reading scrollHeight forces a
  // layout, so the un-coalesced version was a forced reflow + postMessage storm
  // on every keystroke. One send per frame is enough for a height sync.
  let frame = 0;
  const scheduleSend = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      send();
    });
  };

  const observer = new MutationObserver(scheduleSend);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  window.addEventListener('resize', scheduleSend, { passive: true });

  // Re-sync shortly after fonts/images settle.
  setTimeout(send, 150);
  setTimeout(send, 600);
  send();
  return send;
}
