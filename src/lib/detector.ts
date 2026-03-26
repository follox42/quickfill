import { FieldType, DetectedField } from './types';

/**
 * Field detection patterns — the core IP of QuickFill.
 *
 * Priority order:
 * 1. autocomplete attribute (most reliable, browser standard)
 * 2. name/id attribute patterns
 * 3. Associated label text
 * 4. placeholder text
 * 5. aria-label / aria-labelledby
 */

interface FieldPattern {
  autocomplete: string[];
  nameId: RegExp[];
  label: RegExp[];
  placeholder: RegExp[];
  inputType?: string;
}

const PATTERNS: Record<FieldType, FieldPattern> = {
  firstName: {
    autocomplete: ['given-name'],
    nameId: [/first.?name/i, /fname/i, /prenom/i, /given.?name/i, /forename/i, /first$/i],
    label: [/first\s*name/i, /pr[ée]nom/i, /given\s*name/i, /forename/i],
    placeholder: [/first\s*name/i, /pr[ée]nom/i, /given\s*name/i],
  },
  lastName: {
    autocomplete: ['family-name'],
    nameId: [/last.?name/i, /lname/i, /surname/i, /family.?name/i, /nom.?famille/i, /last$/i],
    label: [/last\s*name/i, /nom(\s*de\s*famille)?$/i, /surname/i, /family\s*name/i],
    placeholder: [/last\s*name/i, /nom(\s*de\s*famille)?$/i, /surname/i],
  },
  fullName: {
    autocomplete: ['name'],
    nameId: [/^name$/i, /full.?name/i, /your.?name/i, /nom.?complet/i],
    label: [/^name$/i, /full\s*name/i, /your\s*name/i, /nom\s*complet/i],
    placeholder: [/^name$/i, /full\s*name/i, /your\s*name/i],
  },
  email: {
    autocomplete: ['email'],
    nameId: [/e?.?mail/i, /courriel/i],
    label: [/e?.?mail/i, /courriel/i],
    placeholder: [/e?.?mail/i, /courriel/i, /you@/i],
    inputType: 'email',
  },
  phone: {
    autocomplete: ['tel', 'tel-national'],
    nameId: [/phone/i, /tel(?:ephone)?/i, /mobile/i, /cell/i, /t[ée]l[ée]phone/i],
    label: [/phone/i, /tel(?:ephone)?/i, /mobile/i, /t[ée]l[ée]phone/i],
    placeholder: [/phone/i, /tel/i, /mobile/i, /\+\d/],
    inputType: 'tel',
  },
  company: {
    autocomplete: ['organization'],
    nameId: [/company/i, /org(?:anization)?/i, /entreprise/i, /soci[ée]t[ée]/i, /business/i],
    label: [/company/i, /organization/i, /entreprise/i, /soci[ée]t[ée]/i],
    placeholder: [/company/i, /organization/i, /entreprise/i],
  },
  jobTitle: {
    autocomplete: ['organization-title'],
    nameId: [/job.?title/i, /position/i, /role/i, /poste/i, /fonction/i, /title/i],
    label: [/job\s*title/i, /position/i, /role/i, /poste/i, /fonction/i],
    placeholder: [/job\s*title/i, /position/i, /your\s*role/i],
  },
  address: {
    autocomplete: ['street-address', 'address-line1'],
    nameId: [/address/i, /street/i, /adresse/i, /rue/i, /addr(?:ess)?1/i],
    label: [/address/i, /street/i, /adresse/i, /rue/i],
    placeholder: [/address/i, /street/i, /adresse/i, /123\s*main/i],
  },
  addressLine2: {
    autocomplete: ['address-line2'],
    nameId: [/addr(?:ess)?2/i, /address.?line.?2/i, /apt/i, /suite/i, /unit/i, /complement/i],
    label: [/address\s*(?:line\s*)?2/i, /apt|suite|unit/i, /compl[ée]ment/i],
    placeholder: [/apt|suite|unit/i, /compl[ée]ment/i, /address\s*2/i],
  },
  city: {
    autocomplete: ['address-level2'],
    nameId: [/city/i, /ville/i, /town/i, /locality/i, /commune/i],
    label: [/city/i, /ville/i, /town/i, /locality/i, /commune/i],
    placeholder: [/city/i, /ville/i, /town/i],
  },
  state: {
    autocomplete: ['address-level1'],
    nameId: [/state/i, /province/i, /region/i, /d[ée]partement/i, /county/i],
    label: [/state/i, /province/i, /r[ée]gion/i, /d[ée]partement/i, /county/i],
    placeholder: [/state/i, /province/i, /region/i],
  },
  zipCode: {
    autocomplete: ['postal-code'],
    nameId: [/zip/i, /postal/i, /code.?postal/i, /postcode/i, /cep/i, /plz/i],
    label: [/zip/i, /postal\s*code/i, /code\s*postal/i, /postcode/i],
    placeholder: [/zip/i, /postal/i, /\d{5}/],
  },
  country: {
    autocomplete: ['country', 'country-name'],
    nameId: [/country/i, /pays/i, /nation/i, /land$/i],
    label: [/country/i, /pays/i],
    placeholder: [/country/i, /pays/i, /select.*country/i],
  },
  username: {
    autocomplete: ['username'],
    nameId: [/user.?name/i, /login/i, /identifiant/i, /pseudo/i, /handle/i],
    label: [/username/i, /login/i, /identifiant/i],
    placeholder: [/username/i, /login/i],
  },
  birthDate: {
    autocomplete: ['bday'],
    nameId: [/birth.?d/i, /dob/i, /date.?naissance/i, /birthday/i],
    label: [/birth\s*d/i, /date\s*of\s*birth/i, /date\s*de\s*naissance/i],
    placeholder: [/birth/i, /dd.mm.yyyy/i, /mm.dd.yyyy/i],
  },
  birthMonth: {
    autocomplete: ['bday-month'],
    nameId: [/birth.?month/i, /bmonth/i, /mois.?naissance/i],
    label: [/birth\s*month/i, /month\s*of\s*birth/i],
    placeholder: [/month/i, /mois/i],
  },
  birthYear: {
    autocomplete: ['bday-year'],
    nameId: [/birth.?year/i, /byear/i, /ann[ée]e.?naissance/i],
    label: [/birth\s*year/i, /year\s*of\s*birth/i],
    placeholder: [/year/i, /ann[ée]e/i],
  },
  website: {
    autocomplete: ['url'],
    nameId: [/website/i, /url/i, /site.?web/i, /homepage/i, /blog/i],
    label: [/website/i, /url/i, /site\s*web/i],
    placeholder: [/https?:\/\//i, /website/i, /url/i],
    inputType: 'url',
  },
  custom: {
    autocomplete: [],
    nameId: [],
    label: [],
    placeholder: [],
  },
};

/** Build a unique CSS selector for an element */
function buildSelector(el: HTMLElement): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const tag = el.tagName.toLowerCase();
  const name = el.getAttribute('name');
  if (name) return `${tag}[name="${CSS.escape(name)}"]`;

  // Fallback: use nth-of-type
  const parent = el.parentElement;
  if (!parent) return tag;

  const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
  const idx = siblings.indexOf(el);
  const parentSelector = buildSelector(parent);
  return `${parentSelector} > ${tag}:nth-of-type(${idx + 1})`;
}

/** Get the label text for an input element */
function getLabelText(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  // 1. Explicit <label for="...">
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return label.textContent?.trim() || '';
  }

  // 2. Wrapping <label>
  const parentLabel = el.closest('label');
  if (parentLabel) {
    const text = parentLabel.textContent?.replace(el.value || '', '').trim() || '';
    if (text) return text;
  }

  // 3. aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // 4. aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim() || '';
  }

  // 5. Previous sibling text
  const prev = el.previousElementSibling;
  if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN')) {
    return prev.textContent?.trim() || '';
  }

  return '';
}

/** Match an element against field patterns */
function detectFieldType(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): { type: FieldType; confidence: number } | null {
  const autocomplete = el.getAttribute('autocomplete') || '';
  const name = (el.getAttribute('name') || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
  const label = getLabelText(el).toLowerCase();
  const inputType = el instanceof HTMLInputElement ? el.type : '';

  // Skip hidden, submit, button, file, image, reset, checkbox, radio
  const skipTypes = ['hidden', 'submit', 'button', 'file', 'image', 'reset', 'checkbox', 'radio'];
  if (inputType && skipTypes.includes(inputType)) return null;

  // Skip password fields (we don't fill those)
  if (inputType === 'password') return null;

  let bestMatch: { type: FieldType; confidence: number } | null = null;

  for (const [fieldType, pattern] of Object.entries(PATTERNS) as [FieldType, FieldPattern][]) {
    if (fieldType === 'custom') continue;

    let confidence = 0;

    // 1. Autocomplete attribute (highest confidence)
    if (autocomplete && pattern.autocomplete.some(ac => autocomplete.includes(ac))) {
      confidence = 0.95;
    }

    // 2. Input type match
    if (pattern.inputType && inputType === pattern.inputType && confidence < 0.85) {
      confidence = 0.85;
    }

    // 3. Name/ID match
    if (confidence < 0.8) {
      const nameIdStr = `${name} ${id}`;
      if (pattern.nameId.some(re => re.test(nameIdStr))) {
        confidence = Math.max(confidence, 0.8);
      }
    }

    // 4. Label match
    if (confidence < 0.7 && label) {
      if (pattern.label.some(re => re.test(label))) {
        confidence = Math.max(confidence, 0.7);
      }
    }

    // 5. Placeholder match
    if (confidence < 0.6 && placeholder) {
      if (pattern.placeholder.some(re => re.test(placeholder))) {
        confidence = Math.max(confidence, 0.6);
      }
    }

    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { type: fieldType, confidence };
    }
  }

  return bestMatch;
}

/** Detect all fillable fields on the page */
export function detectFields(): DetectedField[] {
  const elements = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );

  const fields: DetectedField[] = [];
  const seen = new Set<string>();

  for (const el of elements) {
    // Skip invisible elements
    if (!el.offsetParent && el.type !== 'hidden') continue;
    if (el.disabled || el.readOnly) continue;

    const match = detectFieldType(el);
    if (!match || match.confidence < 0.5) continue;

    const selector = buildSelector(el);
    if (seen.has(selector)) continue;
    seen.add(selector);

    fields.push({
      selector,
      fieldType: match.type,
      confidence: match.confidence,
      tagName: el.tagName.toLowerCase(),
      inputType: el instanceof HTMLInputElement ? el.type : '',
      currentValue: el.value,
    });
  }

  return fields.sort((a, b) => b.confidence - a.confidence);
}
