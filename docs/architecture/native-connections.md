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

## Current client connection policy — 2026-11-01

This native Workspace contract describes Workspace-side connection evidence
and controls; it does not define the client's intended setup or recovery path
for Gmail, Slack, Calendar or other services connected to their ChatGPT
account. The client manages those host connections and their permissions in
ChatGPT. A separate Workspace connection authorizes Workspace resources, and
subscription entitlement governs applicable proprietary skills/workflows.
Neither a native integration row nor a saved credential establishes the health
of the client's ChatGPT connections. See the [canonical connection and
entitlement model](https://github.com/abostwick12/lead-emergence-control-plane/blob/main/docs/CONNECTION_AUTHORIZATION_ENTITLEMENT_MODEL.md).

This scope note does not establish which native integration routes or
credentials are currently deployed or used.
