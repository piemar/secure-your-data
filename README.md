# MongoDB CSFLE & Queryable Encryption Workshop Application

## Purpose

This interactive web application provides a comprehensive, self-paced learning experience for MongoDB's **Client-Side Field Level Encryption (CSFLE)** and **Queryable Encryption (QE)** technologies. Designed specifically for Solutions Architects, Security Engineers, and developers who need to master MongoDB's encryption capabilities.

### What This Application Provides

- **📊 Interactive Presentation Mode**: Navigate through slides covering encryption concepts, architecture, competitive positioning, and use cases
- **🧪 Hands-On Labs**: Three guided labs with step-by-step instructions, code examples, and progress tracking
  - **Lab 1**: CSFLE Fundamentals with AWS KMS (15 min)
  - **Lab 2**: Queryable Encryption & Range Queries (15 min)
  - **Lab 3**: Migration & Multi-Tenant Patterns (15 min)
- **✅ Built-in Verification**: Check your progress with automated validation tools
- **📈 Leaderboard**: Track progress and compete with others; optional Atlas-backed sync for multi-attendee workshops; moderators can reset the leaderboard from Settings
- **💡 Solution Reveals**: Get hints and full solutions when you need help (with score adjustments)
- **📝 Code Examples**: Working Node.js scripts that demonstrate real-world patterns

### Key Features

- **Zero-Trust Encryption**: Learn how to encrypt data before it reaches the database
- **AWS KMS Integration**: Hands-on experience with envelope encryption and key management
- **GDPR Compliance**: Implement "Right to Erasure" patterns with crypto shredding
- **Multi-Tenant Isolation**: Design SaaS architectures with per-tenant encryption keys
- **Key Rotation**: Master CMK rotation without data re-encryption

---

## Getting Started

**Prerequisites**

- **MongoDB:** Atlas M10+ or local MongoDB 8.0+
- **AWS:** Account with KMS access (see [AWS CLI and SSO setup](#aws-cli-and-sso-setup) below)
- **If running locally:** Node.js 18+, npm, vite 7.x
- **If using Docker:** Docker Desktop

### AWS CLI and SSO setup

Do this **before** starting the stack (Docker or local) so your `.aws` folder has valid credentials when the container mounts it or when lab scripts run.

**── Configure SSO (one-time) ──**

1. Run: `aws configure sso` (or `aws configure sso --profile lab-new`)
2. SSO start URL [None]: `https://d-9067613a84.awsapps.com/start`
3. SSO region [None]: `us-east-1`
4. Select your AWS account and role when prompted
5. Choose a profile name (e.g. "workshop" or "default")

**── Full example session ──**

```bash
aws configure sso --profile lab-new
# SSO session name (Recommended): lab-new
# SSO start URL [None]: https://d-9067613a84.awsapps.com/start
# SSO region [None]: us-east-1
# SSO registration scopes [sso:account:access]: (press Enter)
# → Browser opens for auth; select your AWS account and role (e.g. Solution-Architects.User)
# CLI default client Region [None]: eu-west-2
# CLI default output format [None]: json

# To use this profile:
aws sso login --profile lab-new

# Verify it's working:
aws s3 ls --profile lab-new
```

**── To request a fresh set of credentials ──**

Run in PowerShell, CMD, or a shell (before each workshop session or when the session has expired):

```bash
aws sso login
# Or with a named profile:
aws sso login --profile lab-new
```

**── Tip: Simplest setup ──**

Use profile name "default", or clone your `[profile ...]` block to `[profile default]` in `~/.aws/config` (Windows: `%USERPROFILE%\.aws\config`) so you can leave the Lab Setup profile field empty in the app.

---

### 1. Run with Docker (recommended)

All tools (Node, mongosh, mongo_crypt_shared, AWS CLI) are included in the image. Supports **arm64** (Apple Silicon) and **amd64**.

**On Linux/Mac:** Run the commands below. Your `~/.aws` folder is used by default; no extra setup.

```bash
## Run the inital time, will build the image and start the container
docker compose up app --build --force-recreate
# To restart the container
docker compose restart app
```

**On Windows:** The app must mount your `.aws` folder so lab scripts can use your AWS credentials. Set `AWS_CONFIG_PATH` before starting the stack—choose one of the following.

**PowerShell** (run these two lines, then start the app):

```bash
$env:AWS_CONFIG_PATH = "$env:USERPROFILE\.aws"
docker compose up app --build --force-recreate
```

**Command Prompt (CMD):**

```bash
set AWS_CONFIG_PATH=%USERPROFILE%\.aws
docker compose up app --build --force-recreate
```

**Alternative:** Create a file named `.env` in the same folder as `docker-compose.yml` with one line: `AWS_CONFIG_PATH=C:\Users\YourName\.aws` (replace `YourName` with your Windows username). Then run `docker compose up app --build --force-recreate` as usual; the variable is read from `.env` automatically.

**Workaround if env doesn't work:** If setting `AWS_CONFIG_PATH` in the environment or in `.env` does not work, edit `docker-compose.yml` at the volume line that mounts `.aws` (around line 27) and replace the expression with your Windows path, e.g. `C:\Users\YourName\.aws:/root/.aws`.

---

**After the stack is running**

1. **Open the app:** [http://localhost:8080](http://localhost:8080)
2. **Complete Lab Setup** in the app: enter your MongoDB URI (or use the default when using Docker), choose your AWS profile, and set the AWS region. The in-app Lab Setup screen walks you through this and can run a "Check Prerequisites" to verify tools.
3. **If your AWS SSO session expired:** Run `aws sso login` (or `aws sso login --profile <name>`) again on your host; the container uses your mounted `.aws` folder. See [AWS CLI and SSO setup](#aws-cli-and-sso-setup) above.

---

**Connect to the local MongoDB** (from a terminal on your host, while the stack is running):

```bash
mongosh "mongodb://root:example@127.0.0.1:27017"
```

Use this to inspect data, run ad-hoc queries, or verify lab databases (e.g. `encryption_<suffix>`, `medical_<suffix>`, `hr_<suffix>`). More Docker options (env vars, regions): [Appendix: Configuring the workshop (Docker)](#appendix-configuring-the-workshop-docker). To build the image only: `docker build -t mongodb-workshop .` then use `mongodb-workshop` in docker-compose.

### 2. Run locally

```bash
git clone https://github.com/piemar/secure-your-data
cd secure-your-data
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080), complete **Lab Setup** in the app (MongoDB URI, paths to mongosh and mongo_crypt_shared, AWS profile and region), then start the labs. If you use AWS SSO, run `aws sso login` (or `aws sso login --profile <name>`) on your machine before running lab steps that use KMS.

### Central deployment (multiple attendees)

Use this **only when you host one instance for many attendees who do not run the app (or Docker) themselves** — they only open one URL in a browser. Each attendee still uses **their own Atlas cluster** and **their own cloud account** (AWS/Azure/GCP). The app does not store attendee secrets; URIs stay in the browser.

**When using Docker you don't need this.** The app only uses `WORKSHOP_DEPLOYMENT` when it is **not** running in a container. So if everyone runs the workshop via Docker (the normal case), leave the default and ignore `WORKSHOP_DEPLOYMENT`. Set `central` only if you run the app with e.g. `npm run dev` (no Docker) and share one URL with many attendees — then the UI will tell them to run lab scripts on their own machine instead of claiming "tools are ready" on the server.

**Configuration:**

| Env var | Purpose |
|---------|---------|
| `WORKSHOP_DEPLOYMENT=central` | Use when one instance serves many browser-only attendees. Lab Setup then instructs them to run scripts on their own machine instead of assuming the server’s environment is theirs. |
| `LEADERBOARD_MONGODB_URI` | Connection string for the shared leaderboard. Set on the central server so all attendees see the same leaderboard. |

**Server requirements:**

- The server that serves the app and `/api/*` must have **mongosh** (and Node.js if any verify step uses it) installed so that URI-based verification (e.g. key vault index, encryption checks) can run. Attendees pass their MongoDB URI with each request; the server uses it only to run verification and does not store it.
- **KMS verification** (`/api/verify-kms` and similar) runs AWS/Azure/GCP CLI on the server. The server typically does not have each attendee's cloud credentials (e.g. `aws sso login`). So in central deployment, KMS verification may be **local-only** unless you add a different auth path (e.g. client-side verification); document this for attendees.

**CORS:** If the frontend is served from a different origin than the API (e.g. static hosting on a CDN, API on another host), configure CORS on the central server so the browser can call `/api/*`.

**Optional:** Add rate limiting on `/api/verify-*` and `/api/check-tool` to avoid abuse.

### Application Structure

```
secure-your-data/
├── src/
│   ├── components/
│   │   ├── labs/              # Lab components (Lab1CSFLE, Lab2QueryableEncryption, Lab3RightToErasure)
│   │   ├── presentation/      # Presentation slides and viewer
│   │   ├── layout/            # Sidebar, main layout
│   │   └── settings/          # Workshop settings (moderator: labs, leaderboard reset)
│   ├── context/               # React context (LabContext, WorkshopConfigContext, etc.)
│   └── utils/                 # Validators, leaderboard, workshop storage, etc.
├── Docs/
│   ├── README_WORKSHOP.md     # Full workshop guide (presentation + labs)
│   ├── Guides/                # Security, migration, performance, lab guides
│   └── Enablement/            # Lab patterns and quick reference
└── (project root)             # Create lab scripts here as you follow the labs:
                               # createKey.cjs, keyvault-setup.cjs, testCSFLE.cjs, app.cjs (Lab 1)
                               # createQEDeks.cjs, createQECollection.cjs, insertQEData.cjs, queryQERange.cjs (Lab 2)
                               # migrateToCSFLE.cjs, multiTenantIsolation.cjs, rotateCMK.cjs (Lab 3)
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## Alternative: Using the Documentation Instead

**Prefer reading over the interactive webapp?** 

The complete workshop content is available in markdown format:

👉 **[See `Docs/README_WORKSHOP.md`](./Docs/README_WORKSHOP.md)**

This comprehensive guide includes:
- Full presentation content
- All lab instructions
- Code examples
- Troubleshooting guides
- SA quick reference cards
- Migration and upgrade guides
- Security best practices

You can follow the labs using the documentation alone, or run the web application for interactive steps, verification, and in-browser code execution.

---

## Working Scripts

When using the webapp, you create these Node.js scripts in your **project root** as you follow each lab (or use the in-browser editor and Run button). All lab code uses CommonJS (`.cjs`) and explicit AWS SSO credentials where required.

**Lab 1 – CSFLE:** `keyvault-setup.cjs`, `createKey.cjs`, `keyvault-verify.cjs`, `testCSFLE.cjs`, `app.cjs`  
**Lab 2 – Queryable Encryption:** `createQEDeks.cjs`, `createQECollection.cjs`, `insertQEData.cjs`, `queryQERange.cjs`  
**Lab 3 – Migration & multi-tenant:** `migrateToCSFLE.cjs`, `multiTenantIsolation.cjs`, `rotateCMK.cjs`

### Running scripts (project root)

```bash
# Lab 1
node keyvault-setup.cjs
node createKey.cjs
node testCSFLE.cjs
node app.cjs

# Lab 2
node createQEDeks.cjs
node createQECollection.cjs
node insertQEData.cjs
node queryQERange.cjs

# Lab 3
node migrateToCSFLE.cjs
node multiTenantIsolation.cjs
node rotateCMK.cjs
```

**Reset and re-run:** Use **Reset step** or **Reset progress** in the app to clear lab MongoDB resources (e.g. key vault, `hr.employees`) so you can re-run scripts cleanly.

---

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **MongoDB**: Node.js Driver 7.0.0, mongodb-client-encryption 7.0.0
- **AWS**: @aws-sdk/credential-providers for SSO support

---

## Troubleshooting

### Common Issues

1. **"Bridge connection failed" / "Connection to validation bridge failed"**: Verification and in-browser run use the dev server. Run `npm run dev` so that `/api/verify-*`, `/api/run-node`, and `/api/run-mongosh` are available. The Vite dev server acts as the backend for these requests.
2. **AWS SSO Credentials**: Ensure you've run `aws sso login` before running scripts
3. **KMS Permissions**: Verify your KMS key policy allows `kms:Decrypt` and `kms:GenerateDataKey`
4. **MongoDB Connection**: Check your Atlas connection string and network access

For detailed troubleshooting, see [Docs/README_WORKSHOP.md](./Docs/README_WORKSHOP.md#14-troubleshooting-faq).

---

## Appendix: Configuring the workshop (Docker)

Environment variables (set when running the container) let you choose cloud and region. Image used below: `pierrepetersson/mongodb-workshop-sandbox:latest` (use `mongodb-workshop` if you built locally).

| Env var | Purpose | Example |
|---------|---------|--------|
| `AWS_CONFIG_PATH` | Host path to `.aws` (for KMS/SSO in container). Set on **Windows** so the app can mount your credentials; Linux/Mac default is `$HOME/.aws`. | Windows: `C:\Users\You\.aws` or `%USERPROFILE%\.aws` in `.env` |
| `WORKSHOP_CLOUD` | Target cloud | `aws` (default), `azure`, `gcp` |
| `WORKSHOP_AWS_DEFAULT_REGION` | AWS region in UI | `eu-central-1` |
| `WORKSHOP_GCP_DEFAULT_LOCATION` | GCP KMS location | `global`, `europe-west1` |


When using Docker, `WORKSHOP_DEPLOYMENT` has no effect (ignore it). For central deployment (one URL, many attendees) and other options, see [Central deployment](#central-deployment-multiple-attendees).

---

## Maintainers

### Publishing the Docker image

To publish one image tag that works on both **arm64** (Apple Silicon) and **amd64** (Intel/AMD), build and push with buildx (e.g. to GitHub Container Registry or Docker Hub).

**One-time setup:** The default Docker builder does not support multi-platform builds. Create and use a builder that does (run once per machine):

```bash
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap
```

If `multiarch` already exists, run `docker buildx use multiarch` instead of the first line.

Then build and push (example for Docker Hub user `pierrepetersson`). **You must be logged in** to Docker Hub as the user that owns the repository, and the repository must exist (create it at [hub.docker.com](https://hub.docker.com) if needed). To ensure the image includes the latest code, add `--no-cache` or `--build-arg CACHEBUST=$(date +%s)`:

```bash
docker login
docker buildx build --platform linux/amd64,linux/arm64 --build-arg CACHEBUST=$(date +%s) -t pierrepetersson/mongodb-workshop-sandbox-final:latest --push .
# If you need the image to reflect latest code: add --no-cache or --build-arg CACHEBUST=$(date +%s)
```

Use your own Docker Hub username instead of `pierrepetersson` if you're publishing under a different account (e.g. `youruser/mongodb-workshop:latest`). If you see *"push access denied"* or *"authorization failed"*, run `docker login` and ensure you're pushing to a repository you own.

### When to set `WORKSHOP_DEPLOYMENT=central`

**When using Docker: never.** This variable has no effect when the app runs in a container. Only set `central` if you run the app **without** Docker (e.g. `npm run dev` on a server) and share one URL with many browser-only attendees — then the UI tells them to run scripts on their machine. For Docker-based workshops, ignore it.

---

## Contributing

This is an internal MongoDB Solutions Architect enablement tool. For questions or improvements, please contact the maintainers.

---

## License

Internal use only.
