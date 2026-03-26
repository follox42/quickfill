# r/webdev Post

## Title
I built a Chrome form filler for testing/QA -- TypeScript, MV3, smart field detection (open source)

## Body

If you're anything like me, you fill out the same forms hundreds of times during development. Registration forms, checkout flows, contact forms, address fields... it adds up.

I was using Lightning Autofill but it went paid. So I built **QuickFill** -- a Chrome extension that detects form fields and fills them in one click.

### The interesting part: field detection

The detection algorithm doesn't just look at `name` attributes. It scores fields using a weighted system across multiple signals:

1. **`autocomplete` attribute** -- highest weight, most reliable signal
2. **`name` / `id` attributes** -- pattern-matched against known tokens (e.g., `fname`, `first_name`, `firstName`)
3. **`placeholder` text** -- fuzzy matched
4. **`<label>` text** -- found via `for` attribute or DOM proximity
5. **Input `type`** -- `email`, `tel`, `url` get direct mapping

Each signal contributes to a confidence score. The field gets typed as whatever scores highest. Result: **22/22 standard field types detected** on test suites.

### Tech stack

- **TypeScript** -- strict mode, full type safety
- **esbuild** -- 9ms build time (not a typo)
- **Chrome Manifest V3** -- service workers, no background pages
- **Zero runtime dependencies** -- no React, no framework. Vanilla DOM manipulation for the popup.
- **88KB** total extension size

### Architecture

```
src/
  background/    -- MV3 service worker, message routing
  content/       -- field detection + fill logic (injected into pages)
  popup/         -- profile management UI
  shared/        -- types, constants, field definitions
```

The content script does the heavy lifting. It walks the DOM, scores every `<input>`, `<select>`, and `<textarea>`, maps them to field types, then fills from the active profile. The whole scan + fill takes ~50ms on a typical form.

### Privacy

Zero network requests. No analytics. No telemetry. Data stored in `chrome.storage.local` only. You can verify -- the source is on GitHub.

### Dev use cases

- QA testing with different profiles (personal, work, edge cases)
- Quickly filling registration/login forms during development
- Testing form validation with consistent data
- Demo data for screenshots/recordings

**GitHub:** https://github.com/follox42/quickfill
**Chrome Web Store:** [LINK_TBD]
**Landing page:** https://quickfill.pages.dev

Source is open. PRs welcome. Would love feedback from other devs on the detection approach.
