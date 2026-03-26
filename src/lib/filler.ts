import { Profile, DetectedField, FieldType } from './types';

/**
 * Fill detected fields with profile data.
 * Dispatches proper events so that frameworks (React, Vue, Angular) detect the change.
 */
export function fillFields(fields: DetectedField[], profile: Profile, animate: boolean = true): number {
  let filledCount = 0;

  for (const field of fields) {
    const value = getValueForField(field.fieldType, profile);
    if (!value) continue;

    const el = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(field.selector);
    if (!el) continue;

    if (el instanceof HTMLSelectElement) {
      fillSelect(el, value, animate);
    } else {
      fillInput(el, value, animate);
    }
    filledCount++;
  }

  return filledCount;
}

/** Get the value from a profile for a given field type */
function getValueForField(fieldType: FieldType, profile: Profile): string | undefined {
  // Handle fullName by combining firstName + lastName
  if (fieldType === 'fullName') {
    const first = profile.data.firstName || '';
    const last = profile.data.lastName || '';
    const full = `${first} ${last}`.trim();
    return full || undefined;
  }

  return profile.data[fieldType] || undefined;
}

/** Fill an input/textarea element with proper event dispatching */
function fillInput(el: HTMLInputElement | HTMLTextAreaElement, value: string, animate: boolean): void {
  // Focus the element
  el.focus();
  el.dispatchEvent(new Event('focus', { bubbles: true }));

  if (animate) {
    // Animate: highlight then fill
    el.style.transition = 'background-color 0.3s ease';
    el.style.backgroundColor = '#e0e7ff';

    setTimeout(() => {
      setNativeValue(el, value);
      el.style.backgroundColor = '#c7d2fe';

      setTimeout(() => {
        el.style.backgroundColor = '';
        el.style.transition = '';
      }, 500);
    }, 100);
  } else {
    setNativeValue(el, value);
  }
}

/** Set value using native setter to work with React/Vue/Angular */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  // Use native value setter to bypass framework wrappers
  const nativeSetter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  // Dispatch events in the order a real user would trigger them
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

/** Fill a select element by matching option text or value */
function fillSelect(el: HTMLSelectElement, value: string, animate: boolean): void {
  const valueLower = value.toLowerCase();
  const options = Array.from(el.options);

  // Try exact value match
  let match = options.find(opt => opt.value.toLowerCase() === valueLower);

  // Try text match
  if (!match) {
    match = options.find(opt => opt.text.toLowerCase() === valueLower);
  }

  // Try partial text match
  if (!match) {
    match = options.find(opt => opt.text.toLowerCase().includes(valueLower));
  }

  // Try partial value match
  if (!match) {
    match = options.find(opt => opt.value.toLowerCase().includes(valueLower));
  }

  if (!match) return;

  if (animate) {
    el.style.transition = 'background-color 0.3s ease';
    el.style.backgroundColor = '#e0e7ff';
  }

  el.value = match.value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('input', { bubbles: true }));

  if (animate) {
    setTimeout(() => {
      el.style.backgroundColor = '';
      el.style.transition = '';
    }, 600);
  }
}
