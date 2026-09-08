# ADR 0002: Workspace backend is the shared authority

Status: Accepted

The existing Lead Emergence Workspace backend owns canonical identity,
tenant/workspace mapping, bundle assignments, provider authorization, client
configuration, and domain data. Web UI and MCP tool access resolve from the same
entitlement source.

Plugin installation is never authorization. This decision makes entitlement
removal effective without redeploying the application.
