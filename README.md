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
   - **📈 Leaderboard & Gamification**: Track scores, award points for completed steps, flags, and quests
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

   Before running the application, ensure you have:

   - **Node.js 18+** and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
   - **MongoDB Atlas** M10+ cluster (or local MongoDB 7.0+ Enterprise)
   - **AWS Account** with KMS access (for the labs)
   - **AWS SSO** configured (or IAM user credentials)

   ### Quick Start

   1. **Clone the repository**:
      ```bash
      git clone <YOUR_GIT_URL>
      cd secure-your-data
      ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   **If you use "Local" MongoDB** in the workshop (for the **Run** button in labs), something must be listening on `localhost:27017`. With Docker Compose:
   ```bash
   docker compose up mongo -d
   ```
   Then lab Run (mongosh/Node) will connect to that instance. If you run the full app in Docker (`docker compose up`), the app container uses `MONGODB_URI=mongodb://mongo:27017` automatically.

4. **Open your browser**:
   Navigate to `http://localhost:8080` (or the port shown in your terminal)

5. **Complete the Setup Wizard**:
   - Enter your MongoDB Atlas connection string
   - Configure AWS KMS settings (CMK alias, region)
   - Verify your tools are installed correctly

6. **Start Learning**:
   - Choose **Presentation Mode** to review concepts
   - Or jump into **Lab 1** to start hands-on practice

### Application Structure

```
secure-your-data/
├── src/
│   ├── components/
│   │   ├── labs/              # Lab components (Lab1CSFLE, Lab2QueryableEncryption, etc.)
│   │   ├── presentation/       # Presentation slides and viewer
│   │   ├── workshop/          # Challenge mode, quests, flags, metrics
│   │   └── layout/             # Sidebar, main layout
│   ├── content/                # Content-driven lab definitions
│   │   ├── labs/              # Lab content definitions (WorkshopLabDefinition)
│   │   ├── quests/            # Quest definitions (WorkshopQuest)
│   │   ├── flags/             # Flag definitions (WorkshopFlag)
│   │   └── workshop-templates/ # Workshop templates (WorkshopTemplate)
│   ├── labs/                  # LabRunner and content mappers
│   ├── context/                # React context (LabContext, RoleContext)
│   ├── services/               # ContentService, VerificationService, MetricsService
│   └── utils/                  # Utilities (validators, leaderboard, step enhancements)
├── csfle-scripts/              # Working Node.js scripts for labs
│   ├── createKey.cjs          # Lab 1: Create DEK
│   ├── testCSFLE.cjs          # Lab 1: Test CSFLE
│   ├── createQEDeks.cjs       # Lab 2: Create QE DEKs
│   ├── createQECollection.cjs # Lab 2: Create QE collection
│   ├── insertQEData.cjs       # Lab 2: Insert encrypted data
│   ├── queryQERange.cjs        # Lab 2: Query encrypted data
│   ├── migrateToCSFLE.cjs     # Lab 3: Migration pattern
│   ├── multiTenantIsolation.cjs # Lab 3: Multi-tenant pattern
│   └── rotateCMK.cjs          # Lab 3: Key rotation
└── Docs/
    ├── LAB_MIGRATION_GUIDE.md  # Guide for migrating labs to content-driven format
    ├── LAB_LIBRARY_ARCHITECTURE.md # Lab library and reusability architecture
    └── README_WORKSHOP.md     # Complete workshop documentation (see below)
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

You can follow the labs using just the documentation and the working scripts in the `csfle-scripts/` folder, without needing to run the web application.

---

## Working Scripts

All working Node.js scripts are located in the `csfle-scripts/` folder. These scripts are:
- ✅ Tested and working
- ✅ Use explicit SSO credential filtering
- ✅ Follow MongoDB best practices
- ✅ Include proper error handling

**Important**: The solution code shown in the webapp's "Reveal Solution" buttons matches these working scripts exactly.

### Running Scripts

```bash
cd csfle-scripts

# Lab 1: CSFLE Fundamentals
node createKey.cjs
node testCSFLE.cjs

# Lab 2: Queryable Encryption
node createQEDeks.cjs
node createQECollection.cjs
node insertQEData.cjs
node queryQERange.cjs

# Lab 3: Advanced Patterns
node migrateToCSFLE.cjs
node multiTenantIsolation.cjs
node rotateCMK.cjs
```

---

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **MongoDB**: Node.js Driver 7.0.0, mongodb-client-encryption 7.0.0
- **AWS**: @aws-sdk/credential-providers for SSO support

---

## Troubleshooting

### Common Issues

1. **"Bridge connection failed"**: The application uses client-side validation. No backend is required.
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

Automated tests use **Vitest** and **React Testing Library** (jsdom). They cover app flows, components (Lab Hub, Demo Script, Quest Map, etc.), lab views (legacy and content-driven), enhancement loading, and settings.

- **Run all tests:** `npm test` (or `npx vitest run`)
- **Run in watch mode:** `npm run test:watch`
- **Run a specific file:** `npx vitest run src/test/app-flows.test.tsx`

See **[Docs/TESTING.md](Docs/TESTING.md)** for what is tested, how to run specific suites, how to add tests for new UI, and optional real-browser E2E (Playwright/Cypress).

---

## Contributing

This is an internal MongoDB Solutions Architect enablement tool. For questions or improvements, please contact the maintainers.

---

## License

Internal use only.
