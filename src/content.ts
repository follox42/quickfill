import { detectFields } from './lib/detector';
import { fillFields } from './lib/filler';
import { getActiveProfile, getProfile, getSettings } from './lib/storage';
import { Message, DetectedField } from './lib/types';

let cachedFields: DetectedField[] = [];

/** Scan the page for fillable fields */
function scanPage(): DetectedField[] {
  cachedFields = detectFields();
  return cachedFields;
}

// Initial scan
scanPage();

// Re-scan on dynamic content changes (SPAs, lazy-loaded forms)
const observer = new MutationObserver((mutations) => {
  const hasNewInputs = mutations.some(m =>
    Array.from(m.addedNodes).some(n =>
      n instanceof HTMLElement && (
        n.matches?.('input, select, textarea, form') ||
        n.querySelector?.('input, select, textarea')
      )
    )
  );
  if (hasNewInputs) {
    setTimeout(scanPage, 300); // debounce
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  if (msg.type === 'DETECT_FIELDS') {
    const fields = scanPage();
    sendResponse({ type: 'FIELDS_DETECTED', fields } satisfies Message);
    return true;
  }

  if (msg.type === 'FILL_FORM') {
    (async () => {
      const profile = await getProfile(msg.profileId);
      if (!profile) {
        sendResponse({ type: 'FILL_COMPLETE', filled: 0 } satisfies Message);
        return;
      }

      const fields = scanPage();
      const settings = await getSettings();
      const filled = fillFields(fields, profile, settings.fillAnimation);
      sendResponse({ type: 'FILL_COMPLETE', filled } satisfies Message);
    })();
    return true; // async response
  }

  if (msg.type === 'FILL_WITH_SHORTCUT') {
    (async () => {
      const profile = await getActiveProfile();
      if (!profile) return;

      const fields = scanPage();
      const settings = await getSettings();
      const filled = fillFields(fields, profile, settings.fillAnimation);

      // Show a small toast notification
      showToast(`QuickFill: ${filled} field${filled !== 1 ? 's' : ''} filled`);
    })();
    return true;
  }

  return false;
});

/** Show a small toast notification on the page */
function showToast(text: string): void {
  const existing = document.getElementById('quickfill-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'quickfill-toast';
  toast.textContent = text;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#6366f1',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '500',
    zIndex: '2147483647',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0',
    transform: 'translateY(10px)',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
