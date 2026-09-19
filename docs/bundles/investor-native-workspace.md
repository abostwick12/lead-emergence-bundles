# Investor native research workspace — implementation contract

Native implementation checkpoint, 2026-09-09. Not client shipment or installed-host proof.

Four independent record types support the intended research loop: watchlists,
company theses, filing reviews and market briefs. Native data stays private to
the entitled client. Facts, interpretations, theses, scenarios and predictions
are explicit claim categories, not interchangeable truth labels. Fact claims
require citations. Sources retain publisher, reference, source date, reporting
period, retrieval timestamp, limitations and review state.

A company thesis records a horizon, confidence judgment, supporting/challenging
claims, observable invalidation, catalysts and scenario assumptions. A no-change
conclusion needs a reason and recorded evidence; an empty notebook never proves
that the market had no material changes. Scenario calculations are hypothetical:
weighted returns require an explicitly complete, mutually exclusive set totaling
100%, with every return entered. Missing values are not silently converted to zero.

Assistant writes are complete proposals against an exact immutable base.
Changed sources become unverified. Changed claims, including unchanged claims
whose cited sources changed, become inferred. Native approval preserves these
review needs. Canonical saves, approval/rejection and private history remain
direct-user operations. No trade, position sizing, personal-account requirement
or cross-domain private-record access is implied.

## Public-source path

The implemented native SEC lookup accepts only a public ten-digit CIK and bounded
form/count filters. It uses a fixed SEC host, timeout/size bounds, shared
rate control and per-request authority, including a recheck after fetching.
It returns recent filer-submission metadata and coverage limits, not a full
filing analysis, issuer-wide insider feed, current price or continuous monitor.
A lookup does not import canonical research without user review.

One actual public lookup through the isolated preview was declined by SEC with
HTTP 403. The app returned an honest unavailable state without findings, retry
or identity rotation. Live upstream success remains unverified. Manual research
and metadata-fixture UI tests are distinct from real public-provider proof.

Authoritative requirements inspected on 2026-09-08:

- [SEC public data APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces):
  no personal-account/API-key requirement; recent filer history is bounded and
  additional historical files are separate; browser CORS is not supported.
- [SEC developer guidance](https://www.sec.gov/about/webmaster-frequently-asked-questions):
  declare the automated client, stay below the published access limit, and
  do not evade access errors. A production operator should approve its contact
  identity and aggregate traffic controls before release.
- [SEC Form 13F FAQ](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/frequently-asked-questions-about-form-13f):
  reporting-period snapshots are delayed; short positions are not reported.
  Preserve period end and filing date separately; do not infer a current portfolio.
- [SEC Form 4 instructions](https://www.sec.gov/files/form4.pdf):
  transaction codes, footnotes, derivative context, amendments and 10b5-1
  disclosures matter. Public insider transactions are not nonpublic information.

## Optional Finances investigation

The available plugin metadata resolves Finances to
plugin_connector_693864f100e4819093e6ed9b651239f1. It is listed as enabled/available
and not installed for this user, with an optional canonical Finances dependency.
This establishes listing/dependency status only, not account scopes, accessible
portfolio fields, accuracy or usable runtime tools. No connection or account
access was attempted. Public research remains independent of it.

## Verification and release boundary

Workspace now implements private persistence, native research screens and actual
loopback OAuth/MCP/native parity. These local proofs do not establish hosted
persistence, live upstream success, installed ChatGPT/Codex behavior or client
value. Source evidence and release notes report those stages separately. The
twelve-minute first-value estimate remains a design target until measured.
