import { getProfiles, getSettings, saveSettings } from '../lib/storage';
import { Message, DetectedField, Profile } from '../lib/types';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  jobTitle: 'Job Title',
  address: 'Address',
  addressLine2: 'Address Line 2',
  city: 'City',
  state: 'State / Province',
  zipCode: 'Zip Code',
  country: 'Country',
  username: 'Username',
  birthDate: 'Birth Date',
  birthMonth: 'Birth Month',
  birthYear: 'Birth Year',
  website: 'Website',
};

let currentProfiles: Profile[] = [];
let currentFields: DetectedField[] = [];

const $profileSelect = document.getElementById('profile-select') as HTMLSelectElement;
const $btnFill = document.getElementById('btn-fill') as HTMLButtonElement;
const $btnOptions = document.getElementById('btn-options') as HTMLButtonElement;
const $btnManage = document.getElementById('btn-manage') as HTMLAnchorElement;
const $fieldsList = document.getElementById('fields-list') as HTMLDivElement;
const $fieldsCount = document.getElementById('fields-count') as HTMLSpanElement;
const $status = document.getElementById('status') as HTMLDivElement;

/** Initialize popup */
async function init() {
  currentProfiles = await getProfiles();
  const settings = await getSettings();

  // Populate profile dropdown using safe DOM methods
  $profileSelect.textContent = '';
  for (const profile of currentProfiles) {
    const opt = document.createElement('option');
    opt.value = profile.id;
    opt.textContent = `${profile.icon} ${profile.name}`;
    if (profile.id === settings.activeProfileId || (!settings.activeProfileId && profile === currentProfiles[0])) {
      opt.selected = true;
    }
    $profileSelect.appendChild(opt);
  }

  detectFields();
}

/** Send message to content script on active tab */
async function sendToTab(msg: Message): Promise<any> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, msg);
  } catch {
    return null;
  }
}

/** Detect fields on the current page */
async function detectFields() {
  const response = await sendToTab({ type: 'DETECT_FIELDS' });
  if (response?.fields) {
    currentFields = response.fields;
    renderFields(currentFields);
  } else {
    renderFields([]);
  }
}

/** Create a field item element using safe DOM methods */
function createFieldItem(field: DetectedField): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'field-item';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'field-name';
  nameSpan.textContent = FIELD_LABELS[field.fieldType] || field.fieldType;

  const confSpan = document.createElement('span');
  confSpan.className = 'field-confidence';
  confSpan.textContent = `${Math.round(field.confidence * 100)}%`;

  item.appendChild(nameSpan);
  item.appendChild(confSpan);
  return item;
}

/** Render detected fields list using safe DOM methods */
function renderFields(fields: DetectedField[]) {
  $fieldsCount.textContent = String(fields.length);
  $fieldsList.textContent = '';

  if (fields.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'fields-empty';
    empty.textContent = 'No form fields detected on this page';
    $fieldsList.appendChild(empty);
    $btnFill.disabled = true;
    return;
  }

  $btnFill.disabled = false;
  for (const field of fields) {
    $fieldsList.appendChild(createFieldItem(field));
  }
}

/** Show status message */
function showStatus(text: string, type: 'success' | 'error') {
  $status.textContent = text;
  $status.className = `status ${type}`;
  $status.classList.remove('hidden');
  setTimeout(() => $status.classList.add('hidden'), 3000);
}

/** Create the fill button SVG icon */
function createCheckIcon(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', '20 6 9 17 4 12');
  svg.appendChild(polyline);
  return svg;
}

/** Reset the fill button to default state */
function resetFillButton() {
  $btnFill.textContent = '';
  $btnFill.appendChild(createCheckIcon());
  $btnFill.appendChild(document.createTextNode(' Fill This Page'));
  $btnFill.classList.remove('success');
  $btnFill.disabled = currentFields.length === 0;
}

// Event: Profile selection change
$profileSelect.addEventListener('change', async () => {
  await saveSettings({ activeProfileId: $profileSelect.value });
});

// Event: Fill button click
$btnFill.addEventListener('click', async () => {
  const profileId = $profileSelect.value;
  if (!profileId) return;

  $btnFill.disabled = true;
  $btnFill.textContent = 'Filling...';

  const response = await sendToTab({ type: 'FILL_FORM', profileId });

  if (response?.filled > 0) {
    $btnFill.textContent = '';
    $btnFill.appendChild(createCheckIcon());
    const count = response.filled;
    $btnFill.appendChild(document.createTextNode(` ${count} field${count !== 1 ? 's' : ''} filled!`));
    $btnFill.classList.add('success');

    const profileName = currentProfiles.find(p => p.id === profileId)?.name || 'profile';
    showStatus(`Filled ${count} field${count !== 1 ? 's' : ''} with ${profileName}`, 'success');
  } else {
    showStatus('No matching fields found for this profile', 'error');
  }

  setTimeout(resetFillButton, 2000);
});

// Event: Options button
$btnOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

// Event: Manage profiles link
$btnManage.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Init
init();
