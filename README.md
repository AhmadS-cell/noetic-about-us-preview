# Noetic — About Us page previews

Two English About Us concepts, including the mobile interaction fixes reviewed15November2026. The second page is the current mobile review focus.

Deployable pages are in `docs/`. Open `docs/index.html`, or `docs/option-2.html` for the team-led direction. They contain their fonts, images, CSS and scripts, so no installation is required. No external trackers or customer-data collection.

Run `node check-site.mjs` before publishing or changing generated pages. It verifies noindex on every HTML page including404, internal anchors and that image/font assets remain inline. Crawlers must be allowed to read noindex; do not replace it with a robots.txt Disallow block.

Noindex is not access control and is not an absolute guarantee for every search engine. These tags do not control a public repository's GitHub UI. Source should remain private unless the owner explicitly authorizes a visibility change. GitHub Pages may require an eligible paid plan for private source; do not buy a plan or change visibility automatically.

New page copy, layouts and provisional English transliterations remain review drafts, not permanent brand rules. Founder Renad Nagro; co-founder Ibrahim Mousli; Sara Nagro, Creative; Sara Alhamdan, Head of Fashion; Rana Mohamed, Customer Support. No Shopify changes are included.




## Public Pages deployment — 15 November 2026

The owner explicitly authorized making this repository public and enabling GitHub Pages. Visibility changed to public after owner-completed GitHub re-authentication. Pages is enabled from main /docs with HTTPS.

Live links:
- https://ahmads-cell.github.io/noetic-about-us-preview/option-1.html
- https://ahmads-cell.github.io/noetic-about-us-preview/option-2.html
- https://ahmads-cell.github.io/noetic-about-us-preview/

Verified live HTTP200 for index, both options and404.html, with noindex on each. An unknown route returned HTTP404 with the branded noindex HTML. All five responses match the prepared source after Git line-ending normalization. Both options render at390px without horizontal overflow; published option2 portrait selection focuses and scrolls the profile to88.53px below the73px header, and return-to-portraits works. Run node check-site.mjs and node check-live.mjs https://ahmads-cell.github.io/noetic-about-us-preview/ for regression verification.

Noindex is not access control or an absolute guarantee for all search engines; it does not control the public repository GitHub UI. Earlier private-upload/plan-blocker statements are historical and superseded by this explicit authorization and completed deployment. No permanent brand or Shopify changes.
