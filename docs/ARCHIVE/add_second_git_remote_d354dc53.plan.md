---
name: Add second Git remote
overview: Add the MongoDB proof-of-vibe repo as a second remote so you can push the same branches to both remotes (optionally in one push).
todos: []
isProject: false
---

# Add proof-of-vibe as second remote

## Option A: Separate remote (recommended)

Add a named remote and push when you want:

```bash
git remote add proof-of-vibe https://github.com/mongodb-sc/proof-of-vibe
```

Push your current branch (and optionally all branches) to the new remote:

```bash
git push proof-of-vibe <branch-name>    # e.g. main or master
# or push all branches:
git push proof-of-vibe --all
```

You keep full control: `git push origin` goes to your existing remote, `git push proof-of-vibe` goes to the new one.

---

## Option B: Single push updates both

If you want **one** `git push` to update both remotes, add the new URL as an extra push URL for `origin`:

```bash
git remote add proof-of-vibe https://github.com/mongodb-sc/proof-of-vibe
git remote set-url --add --push origin https://github.com/mongodb-sc/proof-of-vibe
```

**Note:** This only adds the *second* URL. Your existing `origin` fetch URL stays as-is, but you must ensure `origin`’s push URL is still correct. Check with:

```bash
git remote -v
```

If `origin` currently has one URL for both fetch and push, add the *original* URL as the first push URL, then the new one:

```bash
git remote set-url --add --push origin <current-origin-url>
git remote set-url --add --push origin https://github.com/mongodb-sc/proof-of-vibe
```

Then `git push origin <branch>` will push to both.

---

## Verify

After adding the remote:

```bash
git remote -v
```

You should see `proof-of-vibe` (and both push URLs under `origin` if you chose Option B).

---

**Recommendation:** Use **Option A** unless you always want to push to both in one go. Option A is simpler and avoids touching `origin`’s configuration.
