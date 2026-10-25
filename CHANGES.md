# Blog homepage changes

- Updated Open Graph and Twitter card metadata to use the planned 1200 × 630 PNG social preview.
- Reworked the red hero headline, calls to action, story filters, search, and mobile navigation using plain HTML, CSS and vanilla JavaScript.
- Added category filtering, a six-at-a-time Load more control, and a no-results message.
- Added a JSON-backed next-fixture placeholder and links to the club's official fixture page.
- Added WhatsApp channel links in the hero and footer, plus a partner invitation without prices or package claims.
- Added visible keyboard focus styles and removed the external Google Fonts import to reduce external requests.

## TODO / outstanding

- Add an approved club match-day photograph at `/assets/hero-matchday.jpg`; no such file was found in the repository. The hero currently uses a dark red gradient and a labelled photo placeholder.
- Add `/assets/og-blog.png` as a real 1200 × 630 PNG containing the official crest, “Timau Union FC Blog” and “Our club. Our community. Our future.” The homepage metadata is already set to this path, but the binary asset still needs to be added.
- No WhatsApp phone number was supplied; the provided official WhatsApp channel link is used instead.
- No custom sponsor page URL was supplied; the button links to `https://timauunionfc.co.ke/#sponsors`.
- Confirm that the production social preview debugger fetches the updated metadata after publishing.

## Validation status

- Source changes are on a separate review branch; production has not been changed.
- Mobile (360 px / 390 px) and desktop (1280 px) visual browser tests have not been run in this environment.
- Link debugger verification remains pending until the PNG is committed and the branch is published.
