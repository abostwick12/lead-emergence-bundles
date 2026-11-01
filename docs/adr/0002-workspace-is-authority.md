# ADR 0002: Workspace backend is the shared authority

Status: Accepted

The existing Lead Emergence Workspace backend owns canonical identity,
tenant/workspace mapping, bundle assignments, provider authorization, client
configuration, and domain data. Web UI and MCP tool access resolve from the same
entitlement source.

Plugin installation is never authorization. This decision makes entitlement
removal effective without redeploying the application.

## Scope clarification — 2026-11-01

Workspace remains authoritative for its own identity, tenant/workspace mapping,
bundle assignments, resource authorization, client configuration and durable
data. “Provider authorization” here does not make Workspace the owner of a
client's Gmail, Slack, Google Calendar or other third-party connection in
ChatGPT. The client manages those service credentials, consent, permissions,
reconnection and revocation in their own ChatGPT account. The separate
Workspace connection and entitlement to applicable proprietary skills/workflows
under existing access rules are independent. See the [canonical connection and entitlement
model](https://github.com/abostwick12/lead-emergence-control-plane/blob/main/docs/CONNECTION_AUTHORIZATION_ENTITLEMENT_MODEL.md).
