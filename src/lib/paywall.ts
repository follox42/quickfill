import { getSettings } from './storage';

const PRO_URL = 'https://quickfill.dev/pro';

export const PRO_FEATURES = [
  { feature: 'Profiles', free: 'Up to 3', pro: 'Unlimited' },
  { feature: 'Form detection', free: 'Standard', pro: 'Advanced AI' },
  { feature: 'Custom fields', free: '---', pro: 'Unlimited' },
  { feature: 'Auto-fill rules', free: '---', pro: 'Per-site rules' },
  { feature: 'Export / Import', free: '---', pro: 'JSON & CSV' },
  { feature: 'Priority support', free: '---', pro: 'Email & chat' },
];

/** Check if the current user has Pro status */
export async function isUserPro(): Promise<boolean> {
  const settings = await getSettings();
  return settings.isPro;
}

/** Open the Pro payment page */
export function openProPage(): void {
  window.open(PRO_URL, '_blank');
}

/** Show the upgrade modal. Returns a promise that resolves when the modal is closed. */
export function showUpgradeModal(): Promise<void> {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existing = document.getElementById('qf-upgrade-overlay');
    if (existing) existing.remove();

    // --- Overlay ---
    const overlay = document.createElement('div');
    overlay.id = 'qf-upgrade-overlay';
    overlay.className = 'qf-paywall-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // --- Card ---
    const card = document.createElement('div');
    card.className = 'qf-paywall-card';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'qf-paywall-close';
    closeBtn.textContent = '\u00D7'; // multiplication sign (x)
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', close);
    card.appendChild(closeBtn);

    // Badge
    const badge = document.createElement('div');
    badge.className = 'qf-paywall-badge';
    badge.textContent = 'PRO';
    card.appendChild(badge);

    // Title
    const title = document.createElement('h2');
    title.className = 'qf-paywall-title';
    title.textContent = 'Upgrade to QuickFill Pro';
    card.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'qf-paywall-subtitle';
    subtitle.textContent = 'Unlock unlimited profiles and powerful features to fill forms even faster.';
    card.appendChild(subtitle);

    // --- Comparison table ---
    const table = document.createElement('table');
    table.className = 'qf-paywall-table';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['', 'Free', 'Pro'];
    for (const h of headers) {
      const th = document.createElement('th');
      th.textContent = h;
      if (h === 'Pro') th.className = 'qf-paywall-th-pro';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    for (const row of PRO_FEATURES) {
      const tr = document.createElement('tr');

      const tdFeature = document.createElement('td');
      tdFeature.className = 'qf-paywall-td-feature';
      tdFeature.textContent = row.feature;
      tr.appendChild(tdFeature);

      const tdFree = document.createElement('td');
      tdFree.className = 'qf-paywall-td-free';
      tdFree.textContent = row.free;
      tr.appendChild(tdFree);

      const tdPro = document.createElement('td');
      tdPro.className = 'qf-paywall-td-pro';
      tdPro.textContent = row.pro;
      tr.appendChild(tdPro);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    card.appendChild(table);

    // --- CTA section ---
    const ctaSection = document.createElement('div');
    ctaSection.className = 'qf-paywall-cta-section';

    // Primary CTA
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'qf-paywall-cta';
    ctaBtn.textContent = 'Upgrade Now \u2014 5\u20AC/month';
    ctaBtn.addEventListener('click', () => {
      openProPage();
      close();
    });
    ctaSection.appendChild(ctaBtn);

    // Yearly option
    const yearlyBtn = document.createElement('button');
    yearlyBtn.className = 'qf-paywall-yearly';
    yearlyBtn.textContent = '39\u20AC/year (save 35%)';
    yearlyBtn.addEventListener('click', () => {
      openProPage();
      close();
    });
    ctaSection.appendChild(yearlyBtn);

    card.appendChild(ctaSection);

    // --- Assemble ---
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('qf-paywall-visible');
    });

    function close() {
      overlay.classList.remove('qf-paywall-visible');
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
        resolve();
      }, { once: true });
      // Fallback if transition doesn't fire
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
          resolve();
        }
      }, 400);
    }
  });
}
