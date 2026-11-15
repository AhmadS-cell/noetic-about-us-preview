# Mobile fixes and upload — 15 November 2026

Supersedes the earlier mobile profile placement and local-only handoff in REVIEW.md. This is a task-local review record, not permanent brand guidance.

All five portrait buttons tested in the actual in-app browser. Each selects the correct name, role and copy, focuses the profile and scrolls it below the sticky header. The shared profile remains after the complete portrait grid. Back to the portraits restores the complete grid. Story, People, Get to know the team and Back to top tested. The mobile grid now has aligned edges without individual card insets.

Widths319,320,360,390,430px checked: document scrollWidth equals clientWidth, including the user's original319px view. All12 wrap regions have symmetric20px content margins. Desktop1440px selection retains16px clearance below the85px header. Existing44px mobile touch targets retained. Values and FAQ interaction checked. No claim of physical-device, Safari or OS reduced-motion emulation; source retains paused/reduced instant-scroll behavior.

Self-contained GitHub bundle checked separately at390px: Rana profile top88.53px under73px header; correct active region, zero horizontal overflow; Feminine tab selects matching image; all images inline and loaded. Source check:3HTML,54resource references,16anchors. Publication check:4HTML including404, all noindex, no external asset resources or non-HTML downloads.

Uploaded to PRIVATE https://github.com/AhmadS-cell/noetic-about-us-preview on main, commit493ab383c17c7d0fbe79694bcd214cbc04882444. GitHub UI verifies Private and uploaded docs/source/checks. GitHub Pages settings require upgrading or making the repository public. Neither was done. Live noindex verification remains pending a permitted deployment; no public URL is claimed. Noindex is not access control or an absolute guarantee, and does not control a public repository's GitHub UI.

Screenshots are retained in the local Noetic delivery package.


## Public Pages deployment — 15 November 2026

The owner explicitly authorized making this repository public and enabling GitHub Pages. Visibility changed to public after owner-completed GitHub re-authentication. Pages is enabled from main /docs with HTTPS.

Live links:
- https://ahmads-cell.github.io/noetic-about-us-preview/option-1.html
- https://ahmads-cell.github.io/noetic-about-us-preview/option-2.html
- https://ahmads-cell.github.io/noetic-about-us-preview/

Verified live HTTP200 for index, both options and404.html, with noindex on each. An unknown route returned HTTP404 with the branded noindex HTML. All five responses match the prepared source after Git line-ending normalization. Both options render at390px without horizontal overflow; published option2 portrait selection focuses and scrolls the profile to88.53px below the73px header, and return-to-portraits works. Run node check-site.mjs and node check-live.mjs https://ahmads-cell.github.io/noetic-about-us-preview/ for regression verification.

Noindex is not access control or an absolute guarantee for all search engines; it does not control the public repository GitHub UI. Earlier private-upload/plan-blocker statements are historical and superseded by this explicit authorization and completed deployment. No permanent brand or Shopify changes.
