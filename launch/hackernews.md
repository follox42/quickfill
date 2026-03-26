# Hacker News -- Show HN

## Title
Show HN: QuickFill -- Free form auto-filler (Lightning Autofill went paid)

## Body

Lightning Autofill, a Chrome extension with 500K+ users for auto-filling forms, recently switched to a paid model ($5-10/month). I relied on it for daily form filling during development and QA, so I built a free, open-source replacement.

**What it does:** Detects form fields and fills them from saved profiles in one click.

**How detection works:** The content script walks the DOM and scores every input/select/textarea against 5 signal types:

- `autocomplete` attribute (highest weight -- most reliable)
- `name`/`id` attribute pattern matching
- `placeholder` text analysis
- Associated `<label>` text (via `for` attribute or DOM proximity)
- Input `type` attribute

Each signal contributes to a weighted confidence score. The field is mapped to whichever type scores highest. This handles most naming conventions across frameworks and form builders. Current result: 22/22 standard field types detected in testing.

**Tech:**
- TypeScript, strict mode
- esbuild (9ms build)
- Chrome Manifest V3 (service workers)
- Zero runtime dependencies
- 88KB total extension size

**Privacy:** Zero network requests. No analytics, no telemetry, no external calls. All data stored in `chrome.storage.local`. Verifiable from source.

**Free tier:** 3 profiles, 17+ field types, keyboard shortcut (Alt+Q), smart detection.

GitHub: https://github.com/follox42/quickfill
Landing page: https://quickfill.pages.dev
Chrome Web Store: [LINK_TBD]

I'm interested in feedback on the detection algorithm -- especially edge cases where field naming is non-standard. The source is fully open and contributions are welcome.
