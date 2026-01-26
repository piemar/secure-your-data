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
- **📈 Leaderboard**: Track your progress and compete with others (client-side tracking)
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
│   │   └── layout/             # Sidebar, main layout
│   ├── context/                # React context (LabContext, RoleContext)
│   └── utils/                  # Utilities (validators, leaderboard, etc.)
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

## Contributing

This is an internal MongoDB Solutions Architect enablement tool. For questions or improvements, please contact the maintainers.

---

## License

Internal use only.
