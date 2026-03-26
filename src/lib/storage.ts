import { Profile, Settings, DEFAULT_SETTINGS, createDefaultProfiles } from './types';

const KEYS = {
  profiles: 'qf_profiles',
  settings: 'qf_settings',
} as const;

/** Get all profiles from storage */
export async function getProfiles(): Promise<Profile[]> {
  const result = await chrome.storage.sync.get(KEYS.profiles);
  if (!result[KEYS.profiles] || result[KEYS.profiles].length === 0) {
    const defaults = createDefaultProfiles();
    await saveProfiles(defaults);
    return defaults;
  }
  return result[KEYS.profiles];
}

/** Save all profiles to storage */
export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await chrome.storage.sync.set({ [KEYS.profiles]: profiles });
}

/** Get a single profile by ID */
export async function getProfile(id: string): Promise<Profile | undefined> {
  const profiles = await getProfiles();
  return profiles.find(p => p.id === id);
}

/** Add or update a profile */
export async function upsertProfile(profile: Profile): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = { ...profile, updatedAt: Date.now() };
  } else {
    profiles.push(profile);
  }
  await saveProfiles(profiles);
}

/** Delete a profile */
export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  await saveProfiles(profiles.filter(p => p.id !== id));
}

/** Get settings */
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(result[KEYS.settings] || {}) };
}

/** Save settings */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ [KEYS.settings]: { ...current, ...settings } });
}

/** Get active profile (or first available) */
export async function getActiveProfile(): Promise<Profile | undefined> {
  const settings = await getSettings();
  const profiles = await getProfiles();
  return profiles.find(p => p.id === settings.activeProfileId) || profiles[0];
}
