const pptxgen = require('pptxgenjs');
const { htmlToPptxText } = require('html2pptx');
const fs = require('fs');

async function generatePresentation() {
    let pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    // MongoDB Colors
    const MONGODB_GREEN = '00684A';
    const MONGODB_DARK = '21313C';
    const MONGODB_LIGHT = 'F9FBFA';

    // Helper: Add Title Slide
    function addTitleSlide(title, subtitle, footer) {
        let slide = pptx.addSlide();

        slide.addText(title, {
            x: '5%', y: '30%', w: '90%', h: '20%',
            fontSize: 44, bold: true, color: MONGODB_GREEN, align: 'center',
            valign: 'middle'
        });

        if (subtitle) {
            slide.addText(subtitle, {
                x: '5%', y: '50%', w: '90%', h: '10%',
                fontSize: 28, color: MONGODB_DARK, align: 'center'
            });
        }

        if (footer) {
            slide.addText(footer, {
                x: '5%', y: '85%', w: '90%', h: '5%',
                fontSize: 14, color: MONGODB_DARK, align: 'center'
            });
        }
    }

    // Helper: Add Content Slide
    function addContentSlide(title, bullets, speakerNotes) {
        let slide = pptx.addSlide();

        slide.addText(title, {
            x: '5%', y: '5%', w: '90%', h: '10%',
            fontSize: 32, bold: true, color: MONGODB_GREEN
        });

        slide.addShape(pptx.ShapeType.rect, {
            x: '5%', y: '16%', w: '15%', h: 0.05, fill: { color: MONGODB_GREEN }
        });

        let bulletObjects = bullets.map(b => {
            return { text: b, options: { bullet: true, fontSize: 20, color: MONGODB_DARK, margin: [0, 0, 10, 0] } };
        });

        slide.addText(bulletObjects, {
            x: '5%', y: '25%', w: '90%', h: '60%',
            valign: 'top'
        });

        if (speakerNotes) {
            slide.addNotes(speakerNotes);
        }
    }

    // Helper: Add Two Column Slide
    function addTwoColumnSlide(title, leftTitle, leftBullets, rightTitle, rightBullets, speakerNotes) {
        let slide = pptx.addSlide();

        slide.addText(title, {
            x: '5%', y: '5%', w: '90%', h: '10%',
            fontSize: 32, bold: true, color: MONGODB_GREEN
        });

        // Left Column
        slide.addText(leftTitle, {
            x: '5%', y: '20%', w: '43%', h: '5%',
            fontSize: 22, bold: true, color: MONGODB_GREEN
        });

        let leftBulletObjects = leftBullets.map(b => {
            return { text: b, options: { bullet: true, fontSize: 16, color: MONGODB_DARK } };
        });

        slide.addText(leftBulletObjects, {
            x: '5%', y: '28%', w: '43%', h: '60%',
            valign: 'top'
        });

        // Right Column
        slide.addText(rightTitle, {
            x: '52%', y: '20%', w: '43%', h: '5%',
            fontSize: 22, bold: true, color: MONGODB_GREEN
        });

        let rightBulletObjects = rightBullets.map(b => {
            return { text: b, options: { bullet: true, fontSize: 16, color: MONGODB_DARK } };
        });

        slide.addText(rightBulletObjects, {
            x: '52%', y: '28%', w: '43%', h: '60%',
            valign: 'top'
        });

        if (speakerNotes) {
            slide.addNotes(speakerNotes);
        }
    }

    // Helper: Add Code Slide
    function addCodeSlide(title, code, speakerNotes) {
        let slide = pptx.addSlide();

        slide.addText(title, {
            x: '5%', y: '5%', w: '90%', h: '10%',
            fontSize: 32, bold: true, color: MONGODB_GREEN
        });

        slide.addShape(pptx.ShapeType.roundRect, {
            x: '5%', y: '20%', w: '90%', h: '65%',
            fill: { color: '1E1E1E' },
            rectRadius: 0.1
        });

        slide.addText(code, {
            x: '7%', y: '22%', w: '86%', h: '61%',
            fontSize: 14, color: 'E6E6E6', fontFace: 'Courier New',
            valign: 'top'
        });

        if (speakerNotes) {
            slide.addNotes(speakerNotes);
        }
    }

    // Slide 1: Title
    addTitleSlide(
        "MongoDB Client-Side Field Level Encryption & Queryable Encryption",
        "SA Technical Enablement Deep-Dive",
        "45-minute presentation + 3 hands-on labs"
    );

    // Slide 2: Agenda
    addContentSlide(
        "Agenda",
        ["0-5 min: The 'Why' & Compliance Hook", "5-15 min: Cryptographic Fundamentals & Internals", "15-25 min: GDPR & Multi-Cloud Patterns", "25-35 min: CSFLE vs QE Architecture Differences", "35-45 min: Competitive 'Kill' Tracks"],
        "We start with the business case, then go deep into cryptographic internals. GDPR patterns are critical. Comparison is where customers get confused."
    );

    // Slide 3: The Cost of Getting It Wrong
    addContentSlide(
        "The Cost of Getting It Wrong",
        ["€4.4B+ in GDPR fines issued as of 2024", "$1.3M average HIPAA penalty per violation", "GDPR Art 32: 'Encryption of personal data' required", "GDPR Art 17: 'Right to be Forgotten' requires erasure", "PCI-DSS Req 3: Encrypt PAN, manage crypto keys", "SOX: Audit trail + access controls required"],
        "These aren't theoretical risks. GDPR Art 32 explicitly requires encryption. Art 17 requires ability to delete all user data."
    );

    // Slide 4: Use Cases by Industry
    addContentSlide(
        "Industry Use Cases",
        ["Healthcare: Patient records (ePHI), Insurance IDs, Prescriptions (HIPAA)", "Financial: Account numbers, SSN, Tax IDs (PCI-DSS, SOX)", "Gaming/Social: Payments, Chat logs, Identity (COPPA, GDPR)", "Differentiator: Selective encryption + functional queryability"],
        "Selective encryption of sensitive fields while maintaining app functionality. Health: encrypt SSN but leave department searchable."
    );

    // Slide 5: CSFLE vs QE Overview
    addTwoColumnSlide(
        "CSFLE vs Queryable Encryption",
        "CSFLE (4.2+)",
        ["Deterministic/Random modes", "Equality queries only", "Mature/Battle-tested", "Lower overhead", "Share 1 DEK across fields"],
        "QE (7.0+)",
        ["Randomized encryption only", "Equality AND Range queries", "EMM-based crypto breakthrough", "2-3x storage overhead", "REQUIRES separate DEK per field"],
        "CSFLE is mature/simpler. QE enables Range but requires a SEPARATE DEK for EACH encrypted field due to metadata binding."
    );

    // Slide 6: Envelope Encryption Architecture
    addContentSlide(
        "Envelope Encryption Architecture",
        ["KMS Provider (AWS/Azure/GCP/KMIP) - Holds CMK", "MongoDB Key Vault - Holds Encrypted DEKs", "Application Data - Encrypted by DEK (BSON Subtype 6)", "Flow: Client retrieves DEK -> Decrypt via KMS -> Encrypt Data", "Benefit: CMK rotation is cheap (only re-encrypt DEKs)"],
        "Three layers: CMK in KMS, DEK in Key Vault, Data in BSON. Client retrieves encrypted DEK, KMS decrypts using CMK."
    );

    // Slide 7: Structured Encryption & EMMs
    addContentSlide(
        "QE: Structured Encryption & EMMs",
        ["Encrypted Multi-Maps (EMMs) enable server-side logic", "Client generates 'tokens' encoding order relations", "Server tests tokens ($gt, $lt, $eq) without plaintext", "Private Querying: Access patterns redacted from logs", "Security: Randomized encryption still searchable"],
        "EMMs enable server-side range queries. Client generates range tokens. Server tests tokens without knowing values."
    );

    // Slide 8: .esc and .ecoc Collections
    addContentSlide(
        "QE Metadata Collections",
        [".esc (System Catalog): Metadata mapping fields to DEKs", ".ecoc (Context Cache): Stores query tokens", "Impact: Sizing must account for these collections", "Operations: Monthly compaction recommended", "Backups: Must include enxcol_ collections"],
        "QE creates enxcol_ collections. .ecoc stores search tokens—grows and needs monthly compaction."
    );

    // Slide 9: Storage Overhead Challenge
    addContentSlide(
        "Challenge: Storage Overhead",
        ["Q: What is the overhead for a QE Range field?", "A) 1.2x", "B) 1.5x", "C) 2-3x", "D) 5x+", "Answer: C (2-3x overhead)", "Why? Multiple tokens for range capability per field"],
        "Range queries require multiple tokens per value. Tuning min/max precisely saves space."
    );

    // Slide 10: Key Hierarchy Visualization
    addContentSlide(
        "The Key Protection Stack",
        ["☁️ KMS Provider: Enterprise Management", "🔐 CMK (Master): Protects the DEKs", "🔑 DEKs (Data): Stored encrypted, 1 per field (QE)", "📄 Field Data: BSON Subtype 6", "Zero-Downtime Rotation: rewrapManyDataKey()"],
        "KMS -> CMK -> DEK -> Data. Rotation is fast—only re-encrypt small DEK documents."
    );

    // Slide 11: Right to Erasure / GDPR
    addContentSlide(
        "GDPR: Crypto-Shredding at Scale",
        ["Problem: backups/logs contain user data after deletion", "Pattern: 'One DEK per User'", "Action: Delete user's DEK from Key Vault", "Result: All user data (including backups) is unrecoverable", "Compliance: Satisfies Art 17 'Right to be Forgotten'"],
        "Backups make deletion hard. Crypto-shredding is the answer: 1 user = 1 DEK."
    );

    // Slide 12: Multi-Cloud KMS Architecture
    addTwoColumnSlide(
        "Multi-Cloud KMS Architecture",
        "BYOK (Bring Your Own Key)",
        ["Import key material to Cloud KMS", "Full lifecycle control", "Regulation custody compliant", "Higher ops complexity"],
        "Managed Identity",
        ["Cloud provider generates/rotates", "Low overhead / Native integration", "Simpler ops", "Sufficient for most audits"],
        "AWS KMS, Azure Key Vault, GCP Cloud KMS, KMIP. Use different providers for Prod vs DR for true resilience."
    );

    // Slide 13: Automatic vs Explicit Encryption
    addTwoColumnSlide(
        "Integration Strategies",
        "🤖 Automatic",
        ["Define encryptedFields map", "Driver intercepts & encrypts", "No app code changes", "Required for QE Range"],
        "👩‍💻 Explicit",
        ["Manual encrypt/decrypt calls", "Full control over logic", "Retrofitting legacy apps", "Conditional logic support"],
        "Automatic is best for new apps and QE. Explicit offers fine-grained control for edge cases."
    );

    // Slide 14: QE: The encryptedFields Map
    addCodeSlide(
        "QE Configuration Map",
        `const encryptedFields = {
  fields: [
    { path: "ssn", bsonType: "string", queries: { queryType: "equality" } },
    { path: "salary", bsonType: "int",
      queries: { queryType: "range", min: 0, max: 1000000,
                 sparsity: 2, contention: 4 } }
  ]
};`,
        "min/max are REQUIRED for range—tighter bounds = fewer tokens."
    );

    // Slide 15: Query Support Matrix
    addContentSlide(
        "Query Support Matrix",
        ["✅ $eq, $ne, $in - All encrypted modes", "✅ $gt, $lt, $gte, $lte - QE Range only", "❌ $regex, $text search - Unsupported", "❌ Sorting - Unsupported (leaks order)", "❌ Aggregations ($group, $sum) - Unsupported", "Contention Factor: balances throughput vs security"],
        "Search limits: no regex or text search. No server-side sorting. Do aggregations on decrypted data in app."
    );

    // Slide 16: Honest Limitations & Workarounds
    addTwoColumnSlide(
        "Honest Limitations",
        "❌ No-go Zones",
        ["Sorting ciphertext", "Regex/Partial matches", "Server-side aggregations", "Atlas Search on encrypted fields"],
        "✅ SA Workarounds",
        ["Client-side sort after decrypt", "Tokenized search fields", "Anonymized aggregation stores", "Separate analytics read models"],
        "Be honest upfront. Design the schema carefully around these needs."
    );

    // Slide 17: Performance & Operations
    addContentSlide(
        "Ops & Performance Impact",
        ["Storage: 2-3x (Range), 1.5x (Equality)", "Write Latency: ~10% insert overhead", "Writes: 1 insert -> multiple internal writes", "Compaction: Mandatory monthly online cleanup", "Maintenance: Include enxcol_ collections in backups"],
        "Storage is main cost. Latency from multiple internal writes. Compaction is online."
    );

    // Slide 18: KMS & Key Rotation
    addCodeSlide(
        "Rotating Keys (Zero-Downtime)",
        `await clientEncryption.rewrapManyDataKey({}, {
  provider: "aws",
  masterKey: { key: "arn:aws:kms...NEW-CMK" }
});`,
        "rewrapManyDataKey re-encrypts DEKs. Actual documents are never touched."
    );

    // Slide 19: Regulatory Alignment
    addContentSlide(
        "Regulatory Compliance Mapping",
        ["GDPR Art 32: Field-level encryption", "GDPR Art 17: 1 DEK per user (Erasure)", "HIPAA: ePHI as BSON Subtype 6", "PCI-DSS Req 3: Searchable encrypted PAN", "Audit: KMS access logs for auditors"],
        "Auditor artifacts: BSON Subtype 6 docs, KMS CloudTrail logs."
    );

    // Slide 20: Competitive Kill Tracks
    addContentSlide(
        "Competitive Differentiation",
        ["vs Oracle TDE: TDE decrypts in memory (DBAs see data)", "vs Cosmos DB: Cosmos is deterministic-only (leaks patterns)", "vs PostgreSQL: Server-side, no KMS integration", "MongoDB: True zero-trust (server never sees plaintext)", "Differentiator: Random encryption + Range queries"],
        "TDE is disk-at-rest. QE is encryption-in-use. MongoDB is a leader in zero-trust."
    );

    // Slide 21: Customer Discovery Questions
    addContentSlide(
        "SA Discovery Questions",
        ["Who should NOT see this data? (The killer question)", "Is it acceptable for DBAs to see customer SSNs?", "Do you have 'Right to be Forgotten' requirements?", "What is your key management security model?", "Do you need to search encrypted data?"],
        "Insider threat identification unlocks budget. Ask if admins should see sensitive card IDs."
    );

    // Slide 22: Objection Handling
    addContentSlide(
        "Objection Handling",
        ["'We have TDE' -> TDE leaks; we don't.", "'It's too slow' -> security vs performance trade-off.", "'Can't search' -> QE enables Equality and Range.", "'Too complex' -> Automatic mode needs no app changes.", "'Compliance loves TDE' -> mention 'unauthorized access' clauses."],
        "Frame as Risk vs Performance. Use automatic encryption to rebut 'Complexity' objections."
    );

    // Slide 23: Anti-Patterns
    addContentSlide(
        "Encryption Anti-Patterns",
        ["Don't encrypt fields for Sorting", "Don't encrypt fields for Heavy Aggregations", "Don't encrypt EVERYTHING", "Don't use Local Key in production", "Don't skip compaction for active users"],
        "Qualify early. If they must group by the encrypted field on server, QE is the wrong fit."
    );

    // Slide 24: Hands-on Labs Overview
    addContentSlide(
        "Hands-on Training (3 x 34 min)",
        ["Lab 1: CSFLE Fundamentals & Troubleshooting", "Lab 2: QE Internals, .esc/.ecoc, and Sizing", "Lab 3: GDPR Compliance & Crypto-Shredding", "Scenario: AWS KMS integration (Enterprise focus)"],
        "Lab 1 fixes pathing errors. Lab 2 goes deep into metadata. Lab 3 builds Erasure workflow."
    );

    // Slide 25: Key Takeaways
    addContentSlide(
        "Key Takeaways",
        ["QE = Randomized + Range Queries (the big one)", "2-3x storage for Range - Capacity Plan now", "Mandatory DEK per field (QE metadata binding)", "Online Compaction for ongoing performance", "Crypto-shredding satisfies GDPR Art 17", "docs.mongodb.com/qe"],
        "Final checklist: Factor in Range factor. Monthly compaction. Move to Lab 1."
    );

    // Write file
    pptx.writeFile({ fileName: 'MongoDB_Advanced_Security_Node.pptx' })
        .then(fileName => {
            console.log(`✅ Presentation generated: ${fileName}`);
        })
        .catch(err => {
            console.error(`❌ Error: ${err}`);
        });
}

generatePresentation();
