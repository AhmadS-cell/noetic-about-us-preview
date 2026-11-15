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


## Customer presentation finish

Both complete directions are prepared for mobile customer comparison. The chooser omits internal work notes, controls remain readable, both pages share header-aware anchor navigation and comparison controls. See CUSTOMER_PRESENTATION_QA.md for actual rendered and independent checks, detector exceptions and limits. Edit source/, then run node build.mjs, node check-source.mjs and node check-site.mjs. After deployment run node check-live.mjs with the HTTPS site root.


## Original Noetic footer

The owner requires both options to reuse the actual English Noetic store footer from https://noetic.sa/en. The original footer content,8links, company/CR/VAT details, newsletter and social icons replace the proposed footer. Back to top follows the originalstore; bottom presentation links were removed, while the top comparison controls remain. See ORIGINAL_FOOTER_QA.md for verified fidelity, native form behavior and limits. Run node check-footer.mjs to prevent copy/link/form drift from reference/original-footer.html. Do not submit test subscriptions to the realstore.


## Original Noetic header

Both options now use the original store logo,icons,collectionnavigation andmobilemenu hierarchy. Header textsearch uses the original nativeGET endpoint; cart,wishlist,account andArabic controls lead to the realstore. Menu/search behavior andmobile/desktop fit checked; no fakecart/auth data or image-upload claim. The two unwanted option2hero links were removed. Run node check-header.mjs to verify the independent public-source contract in reference/original-header.json. See ORIGINAL_HEADER_QA.md for evidence and intentional responsive adaptations.
