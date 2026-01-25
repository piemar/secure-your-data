# Lab 2: Queryable Encryption & Internals (34 Minutes)

## Goal
Implement Queryable Encryption (QE) with Range indexes on a `salary` field and analyze the resulting metadata collections in Compass.

## Prerequisites
- Completed Lab 1 (AWS KMS setup)
- MongoDB Atlas M10+ cluster
- Node.js 18+

---

## Step 1: Define QE encryptedFields (8 min)
1.  **Configure the range field metadata**:
    ```javascript
    const encryptedFields = {
      fields: [
        {
          path: "salary",
          bsonType: "int",
          queries: {
            queryType: "range",
            min: 0,
            max: 500000,
            sparsity: 2,
            contention: 4
          }
        }
      ]
    };
    ```

**Pro Tip**: Why `min` and `max`? Range tokens are generated based on these bounds. Setting a tighter range improves query efficiency and reduces storage overhead.

---

## Step 2: Create Collection & Insert Data (7 min)
1.  **Create the collection** with metadata:
    ```javascript
    await db.createCollection("salaries", { encryptedFields });
    ```
2.  **Insert sample documents**:
    ```javascript
    await salaries.insertMany([
      { name: "Alice", salary: 75000 },
      { name: "Bob", salary: 120000 },
      { name: "Charlie", salary: 45000 }
    ]);
    ```

---

## Step 3: Range Query Interaction (7 min)
1.  **Execute a range query** on encrypted data:
    ```javascript
    const filter = { salary: { $gt: 50000, $lt: 100000 } };
    const results = await salaries.find(filter).toArray();
    console.log("Filtered results:", results);
    ```

**Checkpoint**: Verify that the query returned Alice correctly. Note that the application sees plaintext `salary` because the driver handled the token generation and decryption.

---

## Step 4: Inspecting Internal Collections (12 min)
1.  Open **MongoDB Compass**.
2.  Find the `salaries` collection.
3.  Note the three sibling collections created automatically:
    - `enxcol_.salaries.esc` (System Catalog)
    - `enxcol_.salaries.ecoc` (Context Cache)
4.  **Analyze .ecoc growth**: Add 10 more documents and refresh Compass. Observe the increase in document count in the `.ecoc` collection.

**Difference Check**: In CSFLE, one DEK can cover multiple fields. In QE, notice that each field's metadata in the `.esc` collection is bound to a specific DEK unique to that field.

---

## Summary Tasks
- Run the profiler and filter by `{ "command.find": "salaries" }`.
- Observe how the query filter is redacted or shows tokens instead of plaintext.
