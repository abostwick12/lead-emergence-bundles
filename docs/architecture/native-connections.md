# Native connection center contract

P13 adds reusable strict connection snapshots, bounded paging, reviewed
disconnect inputs and idempotent receipts in
bundles/workspace-experience/connections.ts. This native privacy contract is
not a model tool, provider adapter or new bundle entitlement.

Workspace implements the evidence source: verified native owner, current
Workspace grants and registration, plan/admission gates, private vault metadata
and independent adapter release flags. Pending consent is visible without
inventing completed setup. Saved credentials never prove a live connection.

Privacy controls remain available after plan suspension. Every disconnect needs
an exact revision, explicit confirmation and request UUID. A retry returns its
original receipt without removing newly authorized access. Google family impact
includes Gmail, Calendar and Drive. Third-party grant removal stays separate.

The public host imports an explicit 34-file allowlist pinned to portable commit
107e106661bf7f3b90e0e69a65333900bb26bca0. No client configuration, credentials,
deployment configuration or private source repository history is exported.
Six plugin and six skill packages are unchanged by P13.

This is implemented native connection management, not notification delivery or
installed-plugin acceptance. All six bundles still require the remaining
client-readiness gates in ../release/client-readiness.md.
