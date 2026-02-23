# MongoDB CSFLE & Queryable Encryption Workshop Application

## Purpose

This interactive web application provides a comprehensive, self-paced learning experience for MongoDB's **Client-Side Field Level Encryption (CSFLE)** and **Queryable Encryption (QE)** technologies. Designed specifically for Solutions Architects, Security Engineers, and developers who need to master MongoDB's encryption capabilities.

### What This Application Provides

- **📊 Interactive Presentation Mode**: Navigate through slides covering encryption concepts, architecture, competitive positioning, and use cases
- **🧪 Hands-On Labs**: Three guided labs with step-by-step instructions, code examples, and progress tracking
  - **Lab 1**: CSFLE Fundamentals with AWS KMS (15 min)
  - **Lab 2**: Queryable Encryption & Range Queries (15 min)
  - **Lab 3**: Migration & Multi-Tenant Patterns (15 min)
- **✅ Built-in Verification**: Check your progress with automated validation tools (requires dev server; see Troubleshooting)
- **📈 Leaderboard**: Track progress and compete with others; optional Atlas-backed sync for multi-attendee workshops; moderators can reset the leaderboard from Settings
- **🎮 Challenge Mode (Quests & Flags)**: Story-driven “incident simulation” experience with quests, flags, and a retail data breach challenge template
- **🧩 Workshop Templates & Modes**: Configure different workshop templates (default, retail, challenge) and switch between Demo, Lab, and Challenge modes
- **📊 Metrics Dashboard (Moderators)**: View workshop analytics (participants, completion rates, failure points) in real time
- **🗄️ Flexible MongoDB Backends**: Run labs against local MongoDB in Docker or an Atlas connection string provided by the moderator
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

### Prerequisites

- **Docker Desktop** (Mac or Windows) — recommended for quick start
- **MongoDB Atlas** M10+ cluster (or local MongoDB 7.0+ Enterprise)
- **AWS Account** with KMS access (for the labs)
- **AWS SSO** configured (or IAM user credentials)

### Quick start using container image

Run the workshop in a container with all required tools pre-installed (Node.js, AWS CLI, mongosh, mongo_crypt_shared). No tool checks are performed — the container has everything. Image supports **arm64** (Apple Silicon) and **amd64** (Intel/AMD).

1. **Pull the image**
   ```bash
   docker pull pierrepetersson/mongodb-workshop-sandbox:latest
   ```

2. **Run the container** (mount AWS config so the app can verify KMS)
   ```bash
   # Mac / Linux — AWS (default)
   docker run -it --rm -p 8080:8080 -v ~/.aws:/root/.aws pierrepetersson/mongodb-workshop-sandbox:latest

   # Windows (PowerShell) — AWS (default)
   docker run -it --rm -p 8080:8080 -v ${env:USERPROFILE}\.aws:/root/.aws pierrepetersson/mongodb-workshop-sandbox:latest
   ```

   **Other clouds (optional):**
   ```bash
   # Azure Key Vault
   docker run -it --rm -p 8080:8080 -e WORKSHOP_CLOUD=azure pierrepetersson/mongodb-workshop-sandbox:latest

   # GCP Cloud KMS
   docker run -it --rm -p 8080:8080 -e WORKSHOP_CLOUD=gcp -e WORKSHOP_GCP_DEFAULT_LOCATION=europe-west1 pierrepetersson/mongodb-workshop-sandbox:latest
   ```

   **Optional:** Pre-fill MongoDB URI
   ```bash
   docker run -it --rm -p 8080:8080 -v ~/.aws:/root/.aws -e MONGODB_URI="mongodb+srv://..." pierrepetersson/mongodb-workshop-sandbox:latest
   ```

3. **Open your browser** at `http://localhost:8080`, complete **Lab Setup** (Atlas connection string), then start learning. If you use **AWS SSO**, run `aws sso login` on your host first.

For more run options (env vars, regions), see [Appendix: Configuring the workshop (Docker)](#appendix-configuring-the-workshop-docker).

### Manual setup (run without Docker)

Use this path if you prefer to run without Docker or need to build the image yourself.

**Quick Start (run with Node.js)**

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd secure-your-data
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** at `http://localhost:8080`, complete the Setup Wizard, then start learning.

**Prerequisites for this path:** Node.js 18+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)), plus MongoDB Atlas, AWS with KMS, and AWS SSO (same as above).

**If you use "Local" MongoDB** in the workshop (for the **Run** button in labs), something must be listening on `localhost:27017`. With Docker Compose:
```bash
docker compose up mongo -d
```
Then lab Run (mongosh/Node) will connect to that instance. If you run the full app in Docker (`docker compose up`), the app container uses `MONGODB_URI=mongodb://mongo:27017` automatically.

**Build the container image from source** (if you don't want to use the published image):
```bash
docker build -f Dockerfile.full -t mongodb-workshop .
```
If the image doesn't reflect your latest code (e.g. after a merge), build without cache:
`docker build --no-cache -f Dockerfile.full -t mongodb-workshop .`

Then use `mongodb-workshop` instead of `pierrepetersson/mongodb-workshop-sandbox:latest` in the `docker run` commands in [Quick start using container image](#quick-start-using-container-image).

### Central deployment (multiple attendees)

Use this **only when you host one instance for many attendees who do not run the app (or Docker) themselves** — they only open one URL in a browser. Each attendee still uses **their own Atlas cluster** and **their own cloud account** (AWS/Azure/GCP). The app does not store attendee secrets; URIs stay in the browser.

**When using Docker you don't need this.** The app only uses `WORKSHOP_DEPLOYMENT` when it is **not** running in a container. So if everyone runs the workshop via Docker (the normal case), leave the default and ignore `WORKSHOP_DEPLOYMENT`. Set `central` only if you run the app with e.g. `npm run dev` (no Docker) and share one URL with many attendees — then the UI will tell them to run lab scripts on their own machine instead of claiming "tools are ready" on the server.

**Configuration:**

| Env var | Purpose |
|---------|---------|
| `WORKSHOP_DEPLOYMENT=central` | Use when one instance serves many browser-only attendees. Lab Setup then instructs them to run scripts on their own machine instead of assuming the server's environment is theirs. |
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
│   │   ├── labs/              # Lab UI (LabViewWithTabs, StepView, Leaderboard, etc.)
│   │   ├── presentation/      # Presentation slides and viewer
│   │   ├── workshop/          # Challenge mode, quests, flags, metrics
│   │   ├── layout/            # Sidebar, main layout
│   │   └── settings/          # Workshop settings (moderator: labs, leaderboard reset)
│   ├── content/
│   │   └── topics/            # Content-driven lab definitions (encryption/csfle, queryable-encryption, etc.)
│   ├── labs/                  # LabRunner, enhancement loader, content mappers
│   ├── context/               # React context (LabContext, WorkshopConfigContext, etc.)
│   ├── services/              # ContentService, VerificationService, MetricsService, leaderboardApi
│   └── utils/                 # Validators, leaderboard, workshop storage, step enhancements
└── (project root)             # Create lab scripts here as you follow the labs:
                               # keyvault-setup.cjs, createKey.cjs, testCSFLE.cjs, app.cjs (Lab 1)
                               # createQEDeks.cjs, createQECollection.cjs, insertQEData.cjs, queryQERange.cjs (Lab 2)
                               # migrateToCSFLE.cjs, multiTenantIsolation.cjs, rotateCMK.cjs (Lab 3)
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests (Vitest)
- `npm run test:watch` - Run tests in watch mode

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

When using the webapp, you create these Node.js scripts in your **project root** as you follow each lab (or use the in-browser editor and Run button). All lab code uses CommonJS (`.cjs`) and explicit AWS SSO credentials where required. The **Run** button in the app executes code in the project root via the dev server (`/api/run-node`).

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

1. **"Bridge connection failed" / "Connection to validation bridge failed"**: Verification and in-browser Run use the dev server. Run `npm run dev` so that `/api/verify-*`, `/api/run-node`, and `/api/run-mongosh` are available. The Vite dev server acts as the backend for these requests.
2. **AWS SSO Credentials**: Ensure you've run `aws sso login` before running scripts
3. **KMS Permissions**: Verify your KMS key policy allows `kms:Decrypt` and `kms:GenerateDataKey`
4. **MongoDB Connection**: Check your Atlas connection string and network access

For detailed troubleshooting, see [Docs/README_WORKSHOP.md](./Docs/README_WORKSHOP.md#14-troubleshooting-faq).

---

## For content creators: Adding a lab

To add a new lab so it appears in the workshop and loads step content correctly:

1. **Architecture and checklist** – [Docs/ARCHITECTURE_AND_ADDING_LABS.md](Docs/ARCHITECTURE_AND_ADDING_LABS.md) explains how content and the enhancement loader work, and what you need to do (lab file, enhancements file, index registration, loader registration).
2. **Master template prompt** – [Docs/ADD_LAB_MASTER_PROMPT.md](Docs/ADD_LAB_MASTER_PROMPT.md) provides a single copy-paste prompt (with user inputs) to generate a full lab plus enhancements and registration steps.
3. **Scripts** – Use `node scripts/create-lab.js` to scaffold a lab (and stub enhancements), then `node scripts/register-lab.js --file=src/content/topics/<topic>/<pov>/lab-<name>.ts` to register it in the index and loader. See [Docs/CONTENT_CREATOR_QUICK_START.md](Docs/CONTENT_CREATOR_QUICK_START.md) for the full workflow.

---

## Testing the frontend

Automated tests use **Vitest** and **React Testing Library** (jsdom). They cover app flows, components (Lab Hub, Demo Script, Quest Map, etc.), lab views (content-driven), enhancement loading, and settings.

- **Run all tests:** `npm test` (or `npx vitest run`)
- **Run in watch mode:** `npm run test:watch`
- **Run a specific file:** `npx vitest run src/test/app-flows.test.tsx`

See **[Docs/TESTING.md](Docs/TESTING.md)** for what is tested, how to run specific suites, how to add tests for new UI, and optional real-browser E2E (Playwright/Cypress).

---

## Appendix: Configuring the workshop (Docker)

Environment variables (set when running the container) let you choose cloud and region. Image used below: `pierrepetersson/mongodb-workshop-sandbox:latest` (use `mongodb-workshop` if you built locally with `Dockerfile.full`).

| Env var | Purpose | Example |
|---------|---------|--------|
| `WORKSHOP_CLOUD` | Target cloud | `aws` (default), `azure`, `gcp` |
| `WORKSHOP_AWS_DEFAULT_REGION` | AWS region in UI | `eu-central-1` |
| `WORKSHOP_GCP_DEFAULT_LOCATION` | GCP KMS location | `global`, `europe-west1` |

**Examples:**
```bash
# AWS (default)
docker run -it --rm -p 8080:8080 -v ~/.aws:/root/.aws pierrepetersson/mongodb-workshop-sandbox:latest

# Azure
docker run -it --rm -p 8080:8080 -e WORKSHOP_CLOUD=azure pierrepetersson/mongodb-workshop-sandbox:latest

# GCP
docker run -it --rm -p 8080:8080 -e WORKSHOP_CLOUD=gcp -e WORKSHOP_GCP_DEFAULT_LOCATION=europe-west1 pierrepetersson/mongodb-workshop-sandbox:latest
```

When using Docker, `WORKSHOP_DEPLOYMENT` has no effect (ignore it). For central deployment (one URL, many attendees) and other options, see [Central deployment](#central-deployment-multiple-attendees).

---

## Maintainers

### Publishing the Docker image

To publish one image tag that works on both **arm64** (Apple Silicon) and **amd64** (Intel/AMD), build and push with buildx (e.g. to GitHub Container Registry or Docker Hub). The full image is built from `Dockerfile.full`; the default `Dockerfile` uses the published base.

**One-time setup:** The default Docker builder does not support multi-platform builds. Create and use a builder that does (run once per machine):

```bash
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap
```

If `multiarch` already exists, run `docker buildx use multiarch` instead of the first line.

Then build and push (example for Docker Hub user `pierrepetersson`). **You must be logged in** to Docker Hub as the user that owns the repository. To ensure the image includes the latest code, add `--no-cache` or `--build-arg CACHEBUST=$(date +%s)`:

```bash
docker login
docker buildx build -f Dockerfile.full --platform linux/amd64,linux/arm64 --build-arg CACHEBUST=$(date +%s) -t pierrepetersson/mongodb-workshop-sandbox:latest --push .
```

Use your own Docker Hub username instead of `pierrepetersson` if you're publishing under a different account. If you see *"push access denied"* or *"authorization failed"*, run `docker login` and ensure you're pushing to a repository you own.

### When to set `WORKSHOP_DEPLOYMENT=central`

**When using Docker: never.** This variable has no effect when the app runs in a container. Only set `central` if you run the app **without** Docker (e.g. `npm run dev` on a server) and share one URL with many browser-only attendees — then the UI tells them to run scripts on their machine. For Docker-based workshops, ignore it.

---

## Contributing

This is an internal MongoDB Solutions Architect enablement tool. For questions or improvements, please contact the maintainers.

---

## License

Internal use only.
