import { getProfiles, saveProfiles, getSettings, saveSettings } from '../lib/storage';
import { Profile, FieldType, generateId } from '../lib/types';
import { isUserPro, showUpgradeModal } from '../lib/paywall';

let profiles: Profile[] = [];
let activeProfileId: string | null = null;

const $profilesList = document.getElementById('profiles-list') as HTMLDivElement;
const $profileLimit = document.getElementById('profile-limit') as HTMLDivElement;
const $btnAdd = document.getElementById('btn-add') as HTMLButtonElement;
const $editorEmpty = document.getElementById('editor-empty') as HTMLDivElement;
const $profileForm = document.getElementById('profile-form') as HTMLFormElement;
const $profileIcon = document.getElementById('profile-icon') as HTMLInputElement;
const $profileName = document.getElementById('profile-name') as HTMLInputElement;
const $btnDelete = document.getElementById('btn-delete') as HTMLButtonElement;

const FIELD_IDS: FieldType[] = [
  'firstName', 'lastName', 'email', 'phone',
  'company', 'jobTitle',
  'address', 'city', 'zipCode', 'state', 'country',
  'username', 'website',
];

const MAX_FREE_PROFILES = 3;

/** Initialize options page */
async function init() {
  profiles = await getProfiles();
  const settings = await getSettings();

  renderProfilesList();
  renderLimit();

  // If there's an active profile, select it
  if (settings.activeProfileId && profiles.find(p => p.id === settings.activeProfileId)) {
    selectProfile(settings.activeProfileId);
  }
}

/** Render the sidebar profiles list using safe DOM methods */
function renderProfilesList() {
  $profilesList.textContent = '';

  for (const profile of profiles) {
    const item = document.createElement('div');
    item.className = `profile-item${profile.id === activeProfileId ? ' active' : ''}`;
    item.dataset.id = profile.id;

    const icon = document.createElement('span');
    icon.className = 'profile-item-icon';
    icon.textContent = profile.icon;

    const name = document.createElement('span');
    name.className = 'profile-item-name';
    name.textContent = profile.name;

    const count = document.createElement('span');
    count.className = 'profile-item-count';
    const filledFields = Object.values(profile.data).filter(v => v && v.trim()).length;
    count.textContent = `${filledFields} fields`;

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(count);

    item.addEventListener('click', () => selectProfile(profile.id));
    $profilesList.appendChild(item);
  }
}

/** Render the profile limit indicator */
async function renderLimit() {
  const pro = await isUserPro();
  if (pro) {
    $profileLimit.textContent = 'Pro plan: Unlimited profiles';
    $btnAdd.disabled = false;
    $btnAdd.title = 'Add profile';
  } else {
    $profileLimit.textContent = `Free plan: ${profiles.length}/${MAX_FREE_PROFILES} profiles`;
    $btnAdd.disabled = false; // always enabled — modal shown on click
    $btnAdd.title = profiles.length >= MAX_FREE_PROFILES
      ? 'Upgrade to Pro for unlimited profiles'
      : 'Add profile';
  }
}

/** Select a profile for editing */
function selectProfile(id: string) {
  activeProfileId = id;
  const profile = profiles.find(p => p.id === id);
  if (!profile) return;

  $editorEmpty.classList.add('hidden');
  $profileForm.classList.remove('hidden');

  // Fill form header
  $profileIcon.value = profile.icon;
  $profileName.value = profile.name;

  // Fill data fields
  for (const fieldId of FIELD_IDS) {
    const input = document.getElementById(`field-${fieldId}`) as HTMLInputElement | null;
    if (input) {
      input.value = profile.data[fieldId] || '';
    }
  }

  // Update sidebar active state
  renderProfilesList();

  // Save as active profile
  saveSettings({ activeProfileId: id });
}

/** Collect form data into a profile */
function collectFormData(): Partial<Record<FieldType, string>> {
  const data: Partial<Record<FieldType, string>> = {};
  for (const fieldId of FIELD_IDS) {
    const input = document.getElementById(`field-${fieldId}`) as HTMLInputElement | null;
    if (input && input.value.trim()) {
      data[fieldId] = input.value.trim();
    }
  }
  return data;
}

/** Save the current profile */
async function saveCurrentProfile() {
  if (!activeProfileId) return;
  const idx = profiles.findIndex(p => p.id === activeProfileId);
  if (idx < 0) return;

  profiles[idx] = {
    ...profiles[idx],
    icon: $profileIcon.value || profiles[idx].icon,
    name: $profileName.value || profiles[idx].name,
    data: collectFormData(),
    updatedAt: Date.now(),
  };

  await saveProfiles(profiles);
  renderProfilesList();
}

// Event: Add profile
$btnAdd.addEventListener('click', async () => {
  const pro = await isUserPro();
  if (!pro && profiles.length >= MAX_FREE_PROFILES) {
    showUpgradeModal();
    return;
  }

  const icons = ['🏠', '💼', '🧪', '🎮', '🎨', '📱', '🌐', '🔬'];
  const newProfile: Profile = {
    id: generateId(),
    name: `Profile ${profiles.length + 1}`,
    icon: icons[profiles.length % icons.length],
    data: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  profiles.push(newProfile);
  await saveProfiles(profiles);
  renderProfilesList();
  renderLimit();
  selectProfile(newProfile.id);
});

// Event: Delete profile
$btnDelete.addEventListener('click', async () => {
  if (!activeProfileId) return;
  if (profiles.length <= 1) {
    alert('You need at least one profile');
    return;
  }

  const profile = profiles.find(p => p.id === activeProfileId);
  if (!confirm(`Delete "${profile?.name}" profile?`)) return;

  profiles = profiles.filter(p => p.id !== activeProfileId);
  await saveProfiles(profiles);

  activeProfileId = null;
  $editorEmpty.classList.remove('hidden');
  $profileForm.classList.add('hidden');

  renderProfilesList();
  renderLimit();
});

// Event: Save profile
$profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await saveCurrentProfile();

  const $btnSave = $profileForm.querySelector('.btn-save') as HTMLButtonElement;
  const originalText = $btnSave.textContent;
  $btnSave.textContent = 'Saved!';
  $btnSave.classList.add('saved');

  setTimeout(() => {
    $btnSave.textContent = originalText;
    $btnSave.classList.remove('saved');
  }, 1500);
});

// Auto-save on input change (debounced)
let saveTimeout: ReturnType<typeof setTimeout>;
$profileForm.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCurrentProfile, 500);
});

// Event: Upgrade banner click
const $upgradeBanner = document.getElementById('upgrade-banner');
if ($upgradeBanner) {
  $upgradeBanner.addEventListener('click', () => {
    showUpgradeModal();
  });
}

// Init
init();
