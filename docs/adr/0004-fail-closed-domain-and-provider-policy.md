# ADR 0004: Domain and provider policy fails closed

Status: Accepted

All workflow preparation requires a server-bound principal, exact tenant and
workspace match, active entitlement, permitted domain operation, sufficient
provider authorization, and operation-specific approval for execution.

Executive coordination defaults to task metadata. Revoked provider grants and
unauthenticated requests are denied.
