# MongoDB Workshop Application

## Purpose

This interactive web application is a **multi-use-case workshop framework** for self-paced and instructor-led MongoDB learning. It started with a focus on **Client-Side Field Level Encryption (CSFLE)** and **Queryable Encryption (QE)** and has been extended to support many topics: **query & search** (CRUD, rich queries, aggregations, text search, geospatial, graph), **encryption** (CSFLE, QE, right-to-erasure), **analytics** (in-place analytics, workload isolation), **scalability** (ingest rate, scale-up, scale-out, consistency), **data management** (flexible schema, change streams), **operations** (backup/recovery, auto-HA, rolling updates, monitoring), **deployment** (portable, migratable, auto-deploy), and **integration** (reporting). Each lab is a guided, step-by-step experience with runnable code (Node, mongosh, C#, Python where supported), built-in verification, and optional leaderboard.

For a **full list of labs with short descriptions**, see **[Docs/LABS.md](Docs/LABS.md)**. For the **documentation index** (adding/validating labs, architecture, guides), see **[Docs/INDEX.md](Docs/INDEX.md)**.

### What This Application Provides

- **📊 Interactive Presentation Mode**: Navigate through slides for the selected topic (concepts, architecture, use cases)
- **🧪 Hands-On Labs**: Guided labs with step-by-step instructions, code examples (Node, mongosh, C#, Python), and progress tracking. Labs are grouped by topic; see [Docs/LABS.md](Docs/LABS.md) for the full catalog.
- **✅ Built-in Verification**: Check your progress with automated validation per step
- **📈 Leaderboard**: Track progress and compete with others; optional Atlas-backed sync for multi-attendee workshops; moderators can reset the leaderboard from Settings
- **💡 Solution Reveals**: Get hints and full solutions when you need help (with score adjustments)
- **📝 Code Examples**: Working scripts in the editor; Run all / Run selection execute against your cluster or terminal

### Example Topics and Use Cases

- **Encryption**: CSFLE with AWS KMS, Queryable Encryption, Right to Erasure & multi-tenant patterns
- **Query & Search**: CRUD, rich queries (filtering, projections, aggregations), text search & autocomplete, geospatial, graph
- **Analytics**: In-place analytics, workload isolation (replica tags, read preference)
- **Scalability**: Ingest rate (bulk operations, replication), scale-up, scale-out, consistency
- **Operations**: Full/partial recovery (RPO/RTO), auto-HA, rolling updates, monitoring
- **Deployment**: Portable (cloud-to-cloud), migratable, auto-deploy
- **Integration**: Reporting with BI Connector

---

## Getting Started

**Prerequisites**

- **MongoDB:** Atlas M10+ or local MongoDB 8.0+
- **AWS (only for encryption labs):** An AWS account with KMS access is required only if you plan to run labs that use AWS resources—specifically **CSFLE Fundamentals** and **Queryable Encryption** (see [Docs/LABS.md](Docs/LABS.md) under Encryption). For all other labs you can skip [AWS CLI and SSO setup](#aws-cli-and-sso-setup).
- **If running locally:** Node.js 18+, npm, vite 7.x
- **If using Docker:** Docker Desktop

### AWS CLI and SSO setup

Required **only for labs that use AWS** (e.g. **Lab 1: CSFLE Fundamentals with AWS KMS** and **Lab 2: Queryable Encryption**). If you are only doing query, analytics, operations, or other non-encryption labs, you can skip this section.

Do this **before** starting the stack (Docker or local) when running those labs, so your `.aws` folder has valid credentials when the container mounts it or when lab scripts run.

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
# First time or when you want a clean rebuild (recommended): build without cache, then start
docker compose build --no-cache app
docker compose up app --force-recreate
# To restart the container (no rebuild)
docker compose restart app
```

For faster rebuilds using cache (e.g. after small changes), you can use: `docker compose up app --build --force-recreate`.

**On Windows:** The app must mount your `.aws` folder so lab scripts can use your AWS credentials. Set `AWS_CONFIG_PATH` before starting the stack—choose one of the following.

**PowerShell** (run these two lines, then start the app):

```bash
$env:AWS_CONFIG_PATH = "$env:USERPROFILE\.aws"
docker compose build --no-cache app
docker compose up app --force-recreate
```

**Command Prompt (CMD):**

```bash
set AWS_CONFIG_PATH=%USERPROFILE%\.aws
docker compose build --no-cache app
docker compose up app --force-recreate
```

**Alternative:** Create a file named `.env` in the same folder as `docker-compose.yml` with one line: `AWS_CONFIG_PATH=C:\Users\YourName\.aws` (replace `YourName` with your Windows username). Then run the same two-step: `docker compose build --no-cache app` and `docker compose up app --force-recreate`; the variable is read from `.env` automatically.

**Workaround if env doesn't work:** If setting `AWS_CONFIG_PATH` in the environment or in `.env` does not work, edit `docker-compose.yml` at the volume line that mounts `.aws` (around line 26) and replace the expression with your Windows path, e.g. `C:\Users\YourName\.aws:/root/.aws`. Then run `docker compose build --no-cache app` and `docker compose up app --force-recreate` as above.

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


| Env var                       | Purpose                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WORKSHOP_DEPLOYMENT=central` | Use when one instance serves many browser-only attendees. Lab Setup then instructs them to run scripts on their own machine instead of assuming the server’s environment is theirs. |
| `LEADERBOARD_MONGODB_URI`     | Connection string for the shared leaderboard. Set on the central server so all attendees see the same leaderboard.                                                                  |


**Server requirements:**

- The server that serves the app and `/api/`* must have **mongosh** (and Node.js if any verify step uses it) installed so that URI-based verification (e.g. key vault index, encryption checks) can run. Attendees pass their MongoDB URI with each request; the server uses it only to run verification and does not store it.
- **KMS verification** (`/api/verify-kms` and similar) runs AWS/Azure/GCP CLI on the server. The server typically does not have each attendee's cloud credentials (e.g. `aws sso login`). So in central deployment, KMS verification may be **local-only** unless you add a different auth path (e.g. client-side verification); document this for attendees.

**CORS:** If the frontend is served from a different origin than the API (e.g. static hosting on a CDN, API on another host), configure CORS on the central server so the browser can call `/api/`*.

**Optional:** Add rate limiting on `/api/verify-`* and `/api/check-tool` to avoid abuse.

### Application Structure

Labs are **content-driven**: definitions and step content live under `src/content/topics/` and are rendered by `LabRunner` (no per-lab TSX components for step content). The golden template labs are Lab 1 (CSFLE), Lab 2 (Queryable Encryption), and Lab 3 (Right to Erasure); their definitions and enhancements are the reference for adding new labs.

```
secure-your-data/
├── src/
│   ├── components/
│   │   ├── labs/              # LabRunner, StepView, layout (content-driven; no Lab1/Lab2/Lab3 TSX for content)
│   │   ├── presentation/      # Presentation slides and viewer
│   │   ├── layout/            # Sidebar, main layout
│   │   └── settings/          # Workshop settings (moderator: labs, leaderboard reset)
│   ├── content/
│   │   └── topics/            # Lab definitions and enhancements (golden: encryption/csfle, queryable-encryption, right-to-erasure)
│   ├── context/               # React context (LabContext, WorkshopConfigContext, etc.)
│   └── utils/                 # Validators, leaderboard, workshop storage, etc.
├── Docs/
│   ├── INDEX.md               # Doc index – start here for all docs
│   ├── README_WORKSHOP.md     # Full workshop guide (presentation + labs)
│   ├── Guides/                # Security, migration, performance, lab guides
│   └── Enablement/            # Lab patterns and quick reference
└── (project root)             # Create lab scripts here as you follow the labs:
                               # createKey.cjs, keyvault-setup.cjs, testCSFLE.cjs, app.cjs (Lab 1)
                               # createQEDeks.cjs, createQECollection.cjs, insertQEData.cjs, queryQERange.cjs (Lab 2)
                               # migrateToCSFLE.cjs, multiTenantIsolation.cjs, rotateCMK.cjs (Lab 3)
```

**Golden template labs (reference for new labs):** Lab 1 — `src/content/topics/encryption/csfle/lab-csfle-fundamentals.ts` + `enhancements.ts`; Lab 2 — `encryption/queryable-encryption/lab-queryable-encryption.ts` + enhancements; Lab 3 — `encryption/right-to-erasure/lab-right-to-erasure.ts` + enhancements. Principles: minimum 3 steps per lab (5–7 for hands-on), execution via **Run all** / **Run selection** in the editor (no Terminal block that runs `node file.cjs`), Node + Mongosh only when the same action can run in mongosh, skeleton + inlineHints for fill-in-the-blank, 4+ key concepts, and `dataRequirements` for labs that need pre-loaded data.

### Adding a new lab

**Full step-by-step:** See **[Docs/ADDING_AND_VALIDATING_LABS.md](./Docs/ADDING_AND_VALIDATING_LABS.md)** for how to add a lab (and how to validate existing labs).

**Short version:**

1. Create a feature branch: `git checkout -b feature/lab-<slug>` (e.g. `feature/lab-graph-traversal`).
2. Open [Docs/ADD_LAB_MASTER_PROMPT.md](./Docs/ADD_LAB_MASTER_PROMPT.md) and run the master prompt in Cursor (or your LLM) with a short **description** and optionally a proof number or source path (e.g. `Docs/Guides/MyLab.md`). The AI generates a plan doc (`Docs/PLAN_<lab-slug>.md`), then the lab file, enhancements, index/loader registration, and tests.
3. Apply the generated edits, then validate: `node scripts/validate-content.js`, run the new lab’s enhancement tests (`npx vitest run src/test/labs/<PovPascal>Enhancements.test.ts`), and if the lab has skeleton + hints run `npm test -- --run src/test/labs/validate-hint-rendering.test.ts`. Open the app to confirm the lab and steps load.

**Validating existing labs:** Use [Docs/VALIDATE_LABS_MASTER_PROMPT.md](./Docs/VALIDATE_LABS_MASTER_PROMPT.md) for a full audit (produces a dated fix plan) or a scoped check by topic/lab. See [Docs/ADDING_AND_VALIDATING_LABS.md](./Docs/ADDING_AND_VALIDATING_LABS.md) for both flows.

More: [Docs/ARCHITECTURE_AND_ADDING_LABS.md](./Docs/ARCHITECTURE_AND_ADDING_LABS.md) (checklist), [Docs/LAB_SAMPLE_DATA_PLAN.md](./Docs/LAB_SAMPLE_DATA_PLAN.md) (pre-loaded data), [Docs/INDEX.md](./Docs/INDEX.md) (full doc index).

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite (Vitest); use `npm test -- --run src/test/labs/validate-hint-rendering.test.ts` for hint-rendering checks when adding labs

---

## Alternative: Using the Documentation Instead

**Prefer reading over the interactive webapp?** 

The complete workshop content is available in markdown format:

👉 **[See `Docs/README_WORKSHOP.md](./Docs/README_WORKSHOP.md)`**

This comprehensive guide includes:

- Full presentation content
- All lab instructions
- Code examples
- Troubleshooting guides
- Quick reference cards
- Migration and upgrade guides
- Security best practices

You can follow the labs using the documentation alone, or run the web application for interactive steps, verification, and in-browser code execution.

---

## Working Scripts

Most labs run code **in the in-browser editor** (Run all / Run selection); you don’t need to create files on disk. For **encryption labs** (Lab 1–3: CSFLE, Queryable Encryption, Migration), you may create `.cjs` scripts in the **project root** as you follow the steps. For the full list of scripts and run order, see **[Docs/README_WORKSHOP.md](./Docs/README_WORKSHOP.md)**. Use **Reset step** or **Reset progress** in the app to clear lab resources (e.g. key vault, collections) and re-run cleanly.

---

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite 7
- **UI**: Radix UI, Tailwind CSS, shadcn-style components; Monaco editor (code), xterm (terminal)
- **Routing / data**: React Router 6, TanStack Query
- **Testing**: Vitest
- **MongoDB**: Node.js driver 7.x, mongodb-client-encryption 7.x (for encryption labs)
- **AWS**: @aws-sdk/credential-providers for SSO (encryption labs)

---

## Troubleshooting

### Common Issues

1. **"Bridge connection failed" / "Connection to validation bridge failed"**: Verification and in-browser run use the dev server. Run `npm run dev` so that `/api/verify-`*, `/api/run-node`, and `/api/run-mongosh` are available. The Vite dev server acts as the backend for these requests.
2. **AWS SSO Credentials**: Ensure you've run `aws sso login` before running scripts
3. **KMS Permissions**: Verify your KMS key policy allows `kms:Decrypt` and `kms:GenerateDataKey`
4. **MongoDB Connection**: Check your Atlas connection string and network access

For detailed troubleshooting, see [Docs/README_WORKSHOP.md](./Docs/README_WORKSHOP.md#15-troubleshooting-faq).

---

## Appendix: Configuring the workshop (Docker)

Environment variables (set when running the container) let you choose cloud and region. Image used below: `pierrepetersson/mongodb-workshop-sandbox:latest` (use `mongodb-workshop` if you built locally).


| Env var                         | Purpose                                                                                                                                      | Example                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `AWS_CONFIG_PATH`               | Host path to `.aws` (for KMS/SSO in container). Set on **Windows** so the app can mount your credentials; Linux/Mac default is `$HOME/.aws`. | Windows: `C:\Users\You\.aws` or `%USERPROFILE%\.aws` in `.env` |
| `WORKSHOP_CLOUD`                | Target cloud                                                                                                                                 | `aws` (default), `azure`, `gcp`                                |
| `WORKSHOP_AWS_DEFAULT_REGION`   | AWS region in UI                                                                                                                             | `eu-central-1`                                                 |
| `WORKSHOP_GCP_DEFAULT_LOCATION` | GCP KMS location                                                                                                                             | `global`, `europe-west1`                                       |


When using Docker, `WORKSHOP_DEPLOYMENT` has no effect (ignore it). For central deployment (one URL, many attendees) and other options, see [Central deployment](#central-deployment-multiple-attendees).

---

## Maintainers

### Publishing the Docker image

To publish one image tag that works on both **arm64** (Apple Silicon) and **amd64** (Intel/AMD), build and push with buildx (e.g. to GitHub Container Registry or Docker Hub).

**One-time setup:** The default Docker builder does not support multi-platform builds. You need a builder that uses the `docker-container` driver.

If you already have a builder named `multiarch`, switch to it and bootstrap:

```bash
docker buildx use multiarch
docker buildx inspect --bootstrap
```

If you don't have one, or you still see *"Multi-platform build is not supported"*, create it (this removes an existing `multiarch` builder if present):

```bash
docker buildx rm multiarch 2>/dev/null || true
docker buildx create --name multiarch --driver docker-container --use
docker buildx inspect --bootstrap
```

Then build and push. **You must be logged in** to Docker Hub (`docker login`) and the repository must exist (create it at [hub.docker.com](https://hub.docker.com) if needed).

The default **Dockerfile** is a thin image that uses `FROM youruser/mongodb-workshop-sandbox:latest`. That base image must already exist on Docker Hub. If it doesn't (e.g. first publish or a variant repo like `...-sandbox-apac`), use **Dockerfile.full** so the image is built from scratch with no pre-published base:

```bash
docker login
# Full image (use this if the base image doesn't exist yet, or for a separate tag like -apac):
docker buildx build -f Dockerfile.full --platform linux/amd64,linux/arm64 --build-arg CACHEBUST=$(date +%s) -t pierrepetersson/mongodb-workshop-sandbox:latest --push .
# Thin image (only after you have published the base as pierrepetersson/mongodb-workshop-sandbox:latest):
# docker buildx build --platform linux/amd64,linux/arm64 --build-arg CACHEBUST=$(date +%s) -t pierrepetersson/mongodb-workshop-sandbox-final:latest --push .
```

Use your own Docker Hub username instead of `pierrepetersson` if you're publishing under a different account. If you see *"push access denied"* or *"authorization failed"*, run `docker login` and ensure you're pushing to a repository you own. If you see *"not found"* when loading metadata for the base image, build with `-f Dockerfile.full`.

### When to set `WORKSHOP_DEPLOYMENT=central`

**When using Docker: never.** This variable has no effect when the app runs in a container. Only set `central` if you run the app **without** Docker (e.g. `npm run dev` on a server) and share one URL with many browser-only attendees — then the UI tells them to run scripts on their machine. For Docker-based workshops, ignore it.

---

## Contributing

This is an internal MongoDB Solutions Architect enablement tool. For questions or improvements, please contact the maintainers.

---

## License

Internal use only.