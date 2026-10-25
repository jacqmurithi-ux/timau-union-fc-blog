# Blog homepage changes

- Refreshed the homepage metadata, red hero, crest branding and mobile navigation using plain HTML, CSS and vanilla JavaScript only.
- Added category filtering, search, accessible pressed states, a no-results message and six-at-a-time loading for when the story list grows.
- Added WhatsApp channel calls to action, social links, a partner invitation and a JSON-backed fixture placeholder.
- Removed the external Google Fonts import and added visible keyboard focus styling to reduce external requests and improve accessibility.
- Social metadata now points to the club's existing crest asset rather than a missing `og-blog.png` file, avoiding a broken preview image URL.

## Assets and content notes

- No approved match-day photograph was present in the repository. The hero uses branded text artwork until an approved photo can be added; no photo has been fabricated.
- The social preview currently uses the official crest SVG. A dedicated 1200 × 630 PNG would provide a better large social card, but has not been added in this change.
- The provided WhatsApp channel is used because no WhatsApp phone number was supplied.
- The partner CTA links to the club's existing sponsor section because no separate sponsor page URL was supplied.
- The fixture data intentionally says to be confirmed rather than inventing an upcoming match.

## Validation status

- Source changes are contained in this pull request; the main club website has not been edited.
- Automated browser viewport testing at 360 px, 390 px and 1280 px and live social debugger verification were not available here. Please verify after GitHub Pages publishes the merged branch.
