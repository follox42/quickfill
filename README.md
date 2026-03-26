# QuickFill — Smart Form Auto-Filler

> Fill any form in one click. Smart field detection, multiple profiles, privacy-first.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chrome.google.com/webstore/detail/quickfill/oiceaomcgjjglomebobifmpffpfceimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What it does

QuickFill fills web forms automatically using saved profiles. It detects 22+ field types with 95%+ accuracy and works with React, Vue, Angular, and plain HTML forms.

**One click → form filled.**

## Features

- **Smart detection** — 22+ field types (name, email, phone, address, company, job title, username, website, birth date, and more)
- **Multiple profiles** — Personal, Work, Test data — switch in one click
- **Works everywhere** — React controlled inputs, Vue, Angular, plain HTML
- **Keyboard shortcut** — `Ctrl+Shift+F` fills instantly without opening the popup
- **Right-click menu** — fill from context menu on any page
- **Privacy-first** — all data stored locally in `chrome.storage.sync`, no servers ever
- **88KB total** — zero impact on browser performance

## How it works

### Field detection (5 signals, ranked by confidence)

1. `autocomplete` attribute (HTML5 spec — most reliable)
2. `name` / `id` attribute (common convention)
3. `placeholder` text
4. Label text (accessibility)
5. `type` attribute (context only)

### React/Vue/Angular compatibility

QuickFill dispatches native browser events using the `HTMLInputElement` prototype setter, which triggers React's synthetic event system:

```js
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;
nativeInputValueSetter.call(input, value);
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
```

## Architecture

```
src/
├── background.ts     # Service worker — keyboard shortcut + context menu
├── content.ts        # Injected script — field detection + form filling
├── popup/
│   ├── popup.ts      # Popup UI — profile selector + field preview
│   └── popup.html
├── options/
│   ├── options.ts    # Profile management (CRUD)
│   └── options.html
└── lib/
    ├── detector.ts   # Field detection engine (22 types, 5 signals)
    ├── filler.ts     # Form filling + native event dispatch
    ├── storage.ts    # chrome.storage.sync wrapper
    └── types.ts      # Shared TypeScript interfaces
```

**Build:** TypeScript + esbuild → 9ms build time, IIFE format, target chrome120

## Development

```bash
# Install dependencies
npm install

# Build (outputs to dist/)
node build.mjs

# Package for Chrome Web Store
cd dist && zip -r ../quickfill-chrome-v1.0.1.zip . -x "*.map"
```

## Permissions

```json
"permissions": ["storage", "activeTab", "scripting"]
```

- `storage` — save profiles in chrome.storage.sync
- `activeTab` — access the current tab when user clicks the extension
- `scripting` — dynamically inject content.js before sending messages

No broad host permissions (`<all_urls>`). Content script is injected on demand only.

## Privacy

- **No servers** — zero backend, zero API calls
- **No tracking** — no analytics, no telemetry
- **Local storage only** — data lives in `chrome.storage.sync` (synced across your Chrome devices via Google account)
- **No data collection** — your personal information never leaves your browser

## License

MIT © 2026 Nolann
