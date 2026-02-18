# Git hooks

The `commit-msg` hook strips any `Co-authored-by:` lines from commit messages so only your name appears as author (e.g. on GitHub).

**Enable for this repo (run once):**

```bash
git config core.hooksPath .githooks
```

After that, all commits (including from Cursor/IDE) will have co-author trailers removed automatically.
