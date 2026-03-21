---
name: Authorize Cursor with GitHub
overview: Steps to authorize Cursor as a GitHub OAuth app (first time or re-auth) and to grant it access to organizations that use SAML SSO.
todos: []
isProject: false
---

# Authorize Cursor with GitHub (OAuth / SAML)

Cursor uses **GitHub OAuth** for sign-in and Git operations. It appears as an **Authorized OAuth App** on GitHub, not as a separate "GitHub App" installation.

---

## 1. Authorize Cursor as an OAuth app (first time or re-auth)

**From Cursor:**

1. Click **Sign in** (top-right or bottom-left account/avatar area).
2. Choose **Continue with GitHub**.
3. Your browser opens GitHub’s authorization page.
4. Review the requested permissions and click **Authorize [Cursor]** (or the app name shown).
5. You’re redirected back to Cursor; you’re now signed in and Cursor is in your **Authorized OAuth Apps**.

**Result:** Cursor is listed under **GitHub → Settings → Applications → Authorized OAuth Apps**. You can revoke it there anytime; next sign-in in Cursor will ask for authorization again.

---

## 2. Grant Cursor access to an organization (e.g. SAML SSO like mongodb-sc)

If the org uses **SAML SSO**, authorizing the app for your user is not enough; you must also **grant the OAuth app for that organization**:

1. Open **[https://github.com/settings/applications](https://github.com/settings/applications)**.
2. Under **Authorized OAuth Apps**, find **Cursor** (or **Visual Studio Code** if Cursor uses that client ID).
3. Click **Configure** (or the app name).
4. In the organization list, find the org (e.g. **mongodb-sc**) and click **Grant** or **Authorize**.
5. If the org uses SAML, complete the SSO sign-in when GitHub redirects you to your IdP.
6. Return to GitHub and confirm the org shows as authorized for the app.

After that, Git operations from Cursor to that org’s repos (e.g. `mongodb-sc/proof-of-vibe`) should work.

---

## 3. If you don’t see “Cursor” in the list

- **“Sign in with GitHub” in Cursor** is what adds the app. If you’ve never used it, do step 1 first.
- Some setups show **Visual Studio Code** instead of Cursor (shared OAuth client). Configure that app and grant the org the same way.
- If the app was revoked: run **Continue with GitHub** again in Cursor to re-authorize.

---

## OAuth app vs GitHub App

- **OAuth app (what Cursor uses):** You sign in with GitHub in Cursor; Cursor gets access to your account and, after you grant, to chosen orgs. Managed under **Settings → Applications → Authorized OAuth Apps**.
- **GitHub App:** Installed on an org or repo by an admin; different flow. Cursor’s normal “Sign in with GitHub” does not use a GitHub App; no extra “install Cursor as a GitHub App” step is required.

---

**Summary:** Use **Continue with GitHub** in Cursor to authorize Cursor as an OAuth app. For SAML orgs, go to **github.com/settings/applications** → your OAuth app → **Configure** → **Grant** for the organization and complete SSO if prompted.