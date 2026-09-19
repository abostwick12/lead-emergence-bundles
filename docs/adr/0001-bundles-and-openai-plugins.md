# ADR 0001: Separate product bundles from OpenAI plugin packaging

Status: Accepted

Product bundles are versioned definitions under bundles/. OpenAI plugins are
distribution adapters under plugins/. Each adapter uses the portable Agent
Plugins root `plugin.json` as its canonical identity and component manifest,
with OpenAI presentation metadata under `extensions.com.openai`. A matching
`.codex-plugin/plugin.json` remains as a compatibility fallback. The repository
marketplace points to the plugin roots.

This keeps Lead Emergence product architecture independent of any one surface
while using the official ChatGPT/Codex packaging model. Skills are discovered
from the fixed root `skills/` directory. MCP or registered-app files are omitted
until those runtimes exist and can be verified, so packaging never implies a
provider connection or authorization grant.
