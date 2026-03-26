# Twitter/X Launch Thread

## Tweet 1 (Hook)
Lightning Autofill had 500K users. Then it went paid ($5-10/mo).

I built a free replacement in a few weeks.

QuickFill: fill any web form in one click. Open source, privacy-first, 88KB.

Here's the story:

[SCREENSHOT: side-by-side of Lightning Autofill's angry reviews vs QuickFill landing page]

## Tweet 2 (The problem)
If you ever filled forms daily -- testing, QA, signups, checkouts -- you know the pain.

Lightning Autofill was THE tool. 500K+ users. Worked great.

Then overnight: paywall. $5-10/month to auto-fill your name and email.

Their reviews went from 5 stars to 1 star.

## Tweet 3 (The decision)
I looked at alternatives. Most were either:
- Bloated (10MB+ extensions doing way too much)
- Privacy nightmares (sending data to servers)
- Also paid

So I thought: how hard can it be to build a form filler?

(Famous last words.)

## Tweet 4 (What I built)
QuickFill detects form fields automatically using 5 signals:

1. autocomplete attribute
2. name/id patterns
3. placeholder text
4. label text
5. input type

Each signal gets a confidence score. Best match wins.

Result: 22/22 field types detected.

[SCREENSHOT: QuickFill popup showing profile with field types]

## Tweet 5 (The tech)
Tech stack:
- TypeScript (strict mode)
- esbuild (9ms builds)
- Chrome Manifest V3
- Zero runtime dependencies

Total size: 88KB.

No React. No framework. Just clean vanilla TS that does one thing well.

[SCREENSHOT: build output showing 9ms time and file sizes]

## Tweet 6 (Privacy angle)
Privacy was non-negotiable:

- Zero network requests
- No analytics
- No telemetry
- Data in chrome.storage.local only
- Source code is public on GitHub

Your form data never leaves your browser. Period.

## Tweet 7 (What you get)
Free tier:
- 3 profiles (personal, work, test)
- 17+ field types
- One-click fill
- Keyboard shortcut (Alt+Q)
- Smart field detection

Pro (coming):
- Unlimited profiles
- Custom field mappings
- Import/export

Free covers 90% of use cases.

[SCREENSHOT: QuickFill filling a form in real-time]

## Tweet 8 (CTA)
QuickFill is live:

Chrome Web Store: [LINK_TBD]
Landing page: https://quickfill.pages.dev
GitHub: https://github.com/follox42/quickfill

If Lightning Autofill going paid frustrated you -- this is for you.

It's free. It's open source. And it works.

RT if you know someone who fills forms all day.

## Tweet 9 (Bonus -- for devs)
For devs specifically:

QuickFill is great for QA testing. Set up profiles with edge-case data, switch between them, fill forms in one click.

No more typing "test@test.com" 50 times a day.

Source is on GitHub. PRs welcome.

## Tweet 10 (Engagement)
What features would you want in a form filler?

I'm building this in public and want to ship what people actually need.

Drop ideas below.
