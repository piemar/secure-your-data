# Workshop Preparation: MongoDB CSFLE & Queryable Encryption

**Use this document as the message body when emailing workshop attendees.**

---

**Subject:** Prepare for the MongoDB CSFLE & Queryable Encryption Workshop

---

Hi everyone,

You're registered for the **MongoDB Client-Side Field Level Encryption (CSFLE) & Queryable Encryption** workshop. To be ready to start the labs when we begin, please install and configure the following **before** the session. You will create your KMS key and connect to Atlas during the lab—this email covers only what you need to have in place beforehand.

**Workshop overview**
- **Audience:** Solutions Architects & Security Engineers  
- **Duration:** ~1.5 hours (45 min presentation + 45 min labs)  
- **Format:** Presentation followed by three guided labs (CSFLE with AWS KMS, Queryable Encryption, Migration & Multi-Tenant patterns)

**Note:** For this first edition of the workshop, all setup and labs have been validated only on **macOS**. Please bring a Mac.

---

## 1. Software to install

Install and verify the following on the laptop you'll use for the workshop.

### 1.1 Node.js 18+ and npm

```bash
brew install node
```

**Verify:**
```bash
node --version   # expect v18.x or higher
npm --version
```

### 1.2 AWS CLI v2

```bash
brew install awscli
```

**Verify:** `aws --version`

### 1.3 mongosh (MongoDB Shell)

```bash
brew install mongosh
```

**Verify:** `mongosh --version`

---

## 2. Accounts and access to configure

### 2.1 MongoDB Atlas

You need a **M10 or higher** cluster. Create one before the workshop so you're ready to connect when the lab starts.

1. Sign in or register at [cloud.mongodb.com](https://cloud.mongodb.com/).  
2. Create a project (or use an existing one).  
3. **Build a Database** → choose **M10** or higher.  
4. Pick cloud provider and region.  
5. Create a database user and note username/password.  
6. **Network Access** → add your IP (or `0.0.0.0/0` for testing only).  
7. **Connect** → **Drivers** → copy the connection string and replace `<password>` with your DB user password.

Save this connection string; you'll enter it in the lab setup wizard.

### 2.2 AWS account and CLI configuration

You need an **AWS account** where you can create and use KMS keys. The labs will guide you through creating the CMK—no need to do it beforehand.

**Configure AWS CLI** (choose one):

**Option A – AWS SSO (if your org uses it):**

1. Run: `aws configure sso`  
2. Enter your SSO start URL (e.g. `https://your-org.awsapps.com/start`).  
3. Enter SSO region (e.g. `eu-central-1`).  
4. Choose AWS account and role.  
5. Set a profile name (e.g. `workshop` or `default`).

**Option B – IAM user credentials:**

1. Run: `aws configure`  
2. Enter your Access Key ID, Secret Access Key, and default region.

**Log in before the workshop** (SSO users only):

```bash
aws sso login --profile workshop
# or, if using default profile:
aws sso login
```

**Verify:**

```bash
aws sts get-caller-identity --profile workshop
# or without profile if using default
```

You should see your account ID and role. Ensure your IAM user/role has permissions to create and use KMS keys (`kms:CreateKey`, `kms:Encrypt`, `kms:Decrypt`, `kms:DescribeKey`, `kms:GenerateDataKey`). If unsure, check with your AWS admin.

---

## 3. Workshop app and tools

### 3.1 Clone workshop app

If we're using the interactive workshop app:

```bash
git clone https://github.com/piemar/secure-your-data.git
cd secure-your-data
npm install
```

Then open the URL shown (e.g. `http://localhost:8080`). In the setup wizard you'll enter your Atlas connection string and create your KMS key.

### 3.2 mongo_crypt_shared (optional, for Lab 2 – Queryable Encryption)

For **Lab 2** (Queryable Encryption), the driver can use the **Crypt Shared Library**.

- Download from the [MongoDB Crypt Shared Library](https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/) page for macOS.  
- Extract the archive and note the path to `mongo_crypt_v1.dylib`.  
- If required by the lab, set `cryptSharedLibPath` in the client options to this path.

The facilitator will confirm if this is needed for your session.

### 3.3 MongoDB Compass (optional)

For inspecting encrypted data in Atlas, [MongoDB Compass](https://www.mongodb.com/products/compass) is useful but not required.

---

## 4. Verification checklist

Before the workshop, confirm:

- [ ] **Node.js 18+** and **npm** installed and on your PATH  
- [ ] **AWS CLI** installed and configured (SSO or IAM)  
- [ ] **mongosh** installed  
- [ ] **MongoDB Atlas** M10+ cluster created; connection string (with password) saved  
- [ ] **AWS** logged in (`aws sso login` if using SSO) and `aws sts get-caller-identity` works  

---

## 5. Day-of tips

- Use a **laptop** (not only a tablet) so you can run terminal commands and Node scripts.  
- Have a **modern browser** (Chrome, Firefox, Edge, Safari) for the presentation and any web-based lab UI.  
- If you hit **firewall/proxy** issues, try from a different network or VPN; Atlas and AWS need outbound HTTPS.  
- Keep your **Atlas connection string** handy (e.g. in a local file or password manager); avoid sharing it in chat or email.

If anything in this setup is blocked by your company (e.g. AWS KMS, MongoDB Atlas), contact us before the workshop so we can suggest alternatives.

Looking forward to the session.

[Your name / Workshop facilitator]
