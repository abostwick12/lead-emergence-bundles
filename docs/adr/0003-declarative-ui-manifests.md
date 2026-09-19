# ADR 0003: Bundle UI is declarative

Status: Accepted

Functional bundles contribute versioned UI manifests rather than React
components. The Workspace Experience composer owns rendering, collision
detection, deterministic ordering, and user preference application.

AI may recommend layout changes but cannot silently persist them.
