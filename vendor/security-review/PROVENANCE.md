# PROVENANCE — security-review

Vendored (frozen) copy of the markdown / instruction surface of Anthropic's
Claude Code Security Reviewer. Only the skill/markdown + license were vendored;
the Python GitHub Action code was intentionally left out.

## Source

- Repository: https://github.com/anthropics/claude-code-security-review
- Branch: `main`
- Vendored: batch 1 — 2026-07-10
- License: MIT — Copyright (c) 2025 Anthropic (see `LICENSE`)
- Fetch method: GitHub RAW (`raw.githubusercontent.com/.../main/...`) via web_fetch, written file-by-file.

### Commit / SHA anchors

The repository's HEAD commit SHA could not be retrieved: the GitHub
`git/trees/main` (recursive and non-recursive) and `git/refs/heads/main`
endpoints repeatedly returned empty through the available fetch tool. The file
tree was instead enumerated via the GitHub contents API and jsDelivr. The
following upstream integrity anchors were captured for the vendored paths:

| Path | Git blob SHA (or dir tree SHA) | Size |
|------|--------------------------------|------|
| `.claude/` (dir tree) | `0ddd33fc5ed7e86de0c55d0f01edf31b3864c0b4` | — |
| `.claude/commands/security-review.md` | `93651ea8b92194a1f739eaf5115ea493746df300` | 10837 |
| `README.md` | `7a48bb4e75202407ea60ac71c0079136a6ea73d9` | 8600 |
| `LICENSE` | `aadec62f5cf87aae35a0423382bca6f2849abdb5` | 1065 |
| `docs/` (dir tree) | `53f7e1edb414f0c22233be84d5b4f7df9cdfa13d` | — |
| `docs/custom-filtering-instructions.md` | jsDelivr sha256 `TrnmR8X8s++AP0KRZWF5TsmzJPJzRZy6jo2cXdyv9QY=` | 2469 |
| `docs/custom-security-scan-instructions.md` | jsDelivr sha256 `vHkcHLEzHztDNZniZmgegAo1K10va4PZ91hl9aZZ3+Y=` | 3758 |
| `examples/custom-false-positive-filtering.txt` | jsDelivr sha256 `8A/oSo9eg3i57VpvUI+q3ZGHeGTJEZZb/EEGhPrtgkY=` | 1971 |
| `examples/custom-security-scan-instructions.txt` | jsDelivr sha256 `KstGB7aku36OwSItmP61bZXaTWFTt221kBH5kF/ZB4w=` | 798 |

## Files vendored (arborescence reproduced)

```
.claude/commands/security-review.md   # the /security-review slash command (the core prompt)
README.md
LICENSE
docs/custom-filtering-instructions.md
docs/custom-security-scan-instructions.md
examples/custom-false-positive-filtering.txt      # instruction template referenced by docs/
examples/custom-security-scan-instructions.txt     # instruction template referenced by docs/
```

## Intentionally NOT vendored

- All Python (the GitHub Action itself): `claudecode/**/*.py` (incl. `prompts.py`,
  `findings_filter.py`, `claude_api_client.py`, `github_action_audit.py`, all `test_*.py`,
  `evals/*.py`), root `__init__.py`, `audit.py`.
- `action.yml`, `.github/workflows/*`, `scripts/*.js`, `pytest.ini`, `.gitignore`.
- `claudecode/evals/README.md` — developer docs for the Python eval harness
  (Python-adjacent documentation, not a skill instruction/prompt file).

## Notes

- The prompts referenced in the task (`claudecode_sast/*`) are implemented in
  Python (`claudecode/prompts.py`), NOT markdown, so they were excluded by the
  "markdown-only" rule. The actual review prompt lives in
  `.claude/commands/security-review.md`, which is vendored.
- The two `examples/*.txt` files are `.txt`, not `.md`, but were included because
  they are the concrete custom-instruction templates that the `docs/*.md` files
  document (non-code instruction content). Drop them if a strict markdown-only
  freeze is desired.
