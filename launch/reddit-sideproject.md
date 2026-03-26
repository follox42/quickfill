# r/SideProject Post

## Title
I built a free Chrome form filler after Lightning Autofill switched to paid and left 500K users stranded

## Body

Hey everyone,

A few weeks ago, Lightning Autofill -- the most popular Chrome form filler with 500K+ users -- went paid. $5-10/month for something that used to be free. Their reviews turned into a graveyard overnight. People were pissed.

I was one of those people. I use form fillers daily (testing apps, filling out the same shipping info, QA workflows). So instead of looking for another extension that would inevitably do the same thing, I built my own.

**QuickFill** -- a Chrome extension that auto-fills any form in one click. Completely free.

### What it does

- Detects 22 out of 22 standard field types automatically (name, email, phone, address, etc.)
- Stores up to 3 profiles (personal, work, testing...)
- One-click fill or keyboard shortcut (Alt+Q)
- 88KB total size. Builds in 9ms. No bloat.
- Privacy-first: all data stays in your browser. Zero network requests. No analytics.

### Tech stack

- TypeScript + esbuild
- Chrome Manifest V3
- Smart field detection using label/placeholder/name/id/autocomplete attribute analysis
- No frameworks, no dependencies beyond dev tooling

### What's next

- More profiles (Pro)
- Custom field mappings
- Import/export profiles
- Maybe Firefox port if there's demand

I'm not trying to build a business here. I just wanted a tool that works, is fast, and doesn't charge me monthly for saving my name and email.

If you've been burned by Lightning Autofill going paid, give it a try. Would love feedback.

**Chrome Web Store:** [LINK_TBD]
**Landing page:** https://quickfill.pages.dev
**GitHub (open source):** https://github.com/follox42/quickfill
