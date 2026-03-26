/** Field types that QuickFill can detect and fill */
export type FieldType =
  | 'firstName' | 'lastName' | 'fullName'
  | 'email' | 'phone'
  | 'company' | 'jobTitle'
  | 'address' | 'addressLine2' | 'city' | 'state' | 'zipCode' | 'country'
  | 'username'
  | 'birthDate' | 'birthMonth' | 'birthYear'
  | 'website'
  | 'custom';

/** A user profile with fill data */
export interface Profile {
  id: string;
  name: string;
  icon: string; // emoji
  data: Partial<Record<FieldType, string>>;
  createdAt: number;
  updatedAt: number;
}

/** Detected form field on a page */
export interface DetectedField {
  selector: string;       // CSS selector to re-find the element
  fieldType: FieldType;
  confidence: number;     // 0-1
  tagName: string;
  inputType: string;
  currentValue: string;
}

/** Message types between popup/background/content */
export type Message =
  | { type: 'DETECT_FIELDS' }
  | { type: 'FIELDS_DETECTED'; fields: DetectedField[] }
  | { type: 'FILL_FORM'; profileId: string }
  | { type: 'FILL_COMPLETE'; filled: number }
  | { type: 'GET_PROFILES' }
  | { type: 'PROFILES_RESULT'; profiles: Profile[]; activeId: string }
  | { type: 'FILL_WITH_SHORTCUT' };

/** App settings */
export interface Settings {
  activeProfileId: string;
  maxFreeProfiles: number;
  isPro: boolean;
  fillAnimation: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  activeProfileId: '',
  maxFreeProfiles: 3,
  isPro: false,
  fillAnimation: true,
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Default starter profiles */
export function createDefaultProfiles(): Profile[] {
  const now = Date.now();
  return [
    {
      id: generateId(),
      name: 'Personal',
      icon: '👤',
      data: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Work',
      icon: '💼',
      data: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}
