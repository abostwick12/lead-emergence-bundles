# ADR 0001: Separate product bundles from OpenAI plugin packaging

Status: Accepted

Product bundles are versioned definitions under bundles/. OpenAI plugins are
distribution adapters under plugins/, using the current required
.codex-plugin/plugin.json shape. The marketplace points to plugin roots.

This keeps Lead Emergence product architecture independent of any one surface
while using the official ChatGPT/Codex packaging model.
