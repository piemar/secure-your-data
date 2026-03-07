import { WorkshopLabDefinition } from '@/types';

/**
 * MongoDB CRUD
 *
 * Covers all Create, Read, Update, and Delete operations with the MongoDB Node.js driver:
 * insertOne/insertMany, find/findOne/cursor/limit/skip, updateOne/updateMany, replaceOne,
 * upserts, deleteOne/deleteMany, and bulkWrite. Aligns with MongoDB Manual CRUD documentation.
 */
export const labMongodbCrudDefinition: WorkshopLabDefinition = {
  id: 'lab-mongodb-crud',
  topicId: 'query',
  title: 'MongoDB CRUD',
  description:
    'Learn all MongoDB CRUD operations: insertOne/insertMany, find/findOne with cursor and pagination, updateOne/updateMany, replaceOne, deleteOne/deleteMany, and bulkWrite with the Node.js driver.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 51,
  tags: ['query', 'crud', 'driver', 'node', 'basics'],
  prerequisites: [
    'MongoDB Atlas cluster (M0 or higher) or local MongoDB',
    'Node.js 18+',
    'MONGODB_URI environment variable set',
  ],
  povCapabilities: ['RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  whatYouWillBuild: [
    'Connect and insert documents with insertOne() and insertMany()',
    'Read with find(), findOne(), and cursor methods (limit(), skip())',
    'Update with updateOne(), updateMany(), and update operators ($set)',
    'Replace a full document with replaceOne()',
    'Upsert: update when a document matches, insert when none matches (upsert: true)',
    'Delete with deleteOne() and deleteMany()',
    'Run batch operations with bulkWrite() (ordered and unordered)',
  ],
  keyInsight:
    'MongoDB CRUD uses the same filter syntax for reads, updates, and deletes; all write operations are atomic at the document level. Use bulkWrite for efficient batch updates and write concern for durability.',
  keyConcepts: [
    {
      term: 'CRUD',
      explanation:
        'Create, Read, Update, Delete—the four basic operations for persisting and retrieving data. You’ll use single-document and multi-document methods for each, plus patterns like upsert and batch writes.',
    },
    {
      term: 'Documents & collections',
      explanation:
        'Data lives in collections as JSON-like documents. Each document has a unique _id (driver can auto-generate one). You target a database and collection, then run operations on documents.',
    },
    {
      term: 'Filter syntax',
      explanation:
        'The same filter object is used for find, update, and delete—e.g. { status: "active" }. One consistent query language across read and write operations.',
    },
    {
      term: 'Document-level atomicity',
      explanation:
        'Each write (insert, update, delete) is atomic on a single document. Batch operations (e.g. bulkWrite) can run many such writes in one round trip.',
    },
    {
      term: 'Cursors & single-doc reads',
      explanation:
        'find() returns a cursor so you can paginate (limit, skip), sort, or resolve with toArray(). findOne() returns a single document or null. Both use the same filter syntax.',
    },
  ],
  steps: [
    {
      id: 'lab-mongodb-crud-step-1',
      title: 'Step 1: Connect and Insert (insertOne & insertMany)',
      narrative:
        'Connecting to MongoDB is the first step in any driver-based application. insertOne() adds a single document and returns its insertedId; insertMany() accepts an array of documents and returns insertedIds. If the collection does not exist, MongoDB creates it automatically.',
      instructions:
        'Create a Node script that connects using MONGODB_URI, selects a database and collection. Call insertOne() with one document and insertMany() with an array of two or three documents. Log the insertedIds. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.connect-insert',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Create Operations',
      hints: [
        'Use MongoClient.connect(uri) and client.db("dbName").collection("collectionName").',
        'insertOne(doc) returns { acknowledged, insertedId }; insertMany([doc1, doc2]) returns { acknowledged, insertedIds }.',
        'MongoDB creates the collection on first insert if it does not exist.',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-2',
      title: 'Step 2: Read with find, findOne, limit, and skip',
      narrative:
        'Read operations retrieve documents. find(filter) returns a cursor—use toArray() to get an array, or chain limit(n) and skip(n) for pagination. findOne(filter) returns a single document or null. The filter uses the same syntax for both; use {} to match all documents.',
      instructions:
        'Use find({}) to get a cursor, then .limit(2).skip(0).toArray() to get the first two documents. Use findOne(filter) to fetch a single document by a field value. Optionally add a projection as the second argument to find() or findOne() to limit returned fields. Log the results.',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.find',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Read Operations',
      hints: [
        'find(filter) returns a cursor; chain .limit(n).skip(n).toArray() for pagination.',
        'findOne(filter) returns a Promise of the document or null.',
        'Projection: second argument { field: 1 } to include, { field: 0 } to exclude (except _id).',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-3',
      title: 'Step 3: Update with updateOne and updateMany',
      narrative:
        'Update operations modify existing documents. updateOne(filter, update) updates the first document matching the filter; updateMany(filter, update) updates all matching documents. The update document typically uses operators like $set to change specific fields. Results include matchedCount and modifiedCount.',
      instructions:
        'Use updateOne(filter, { $set: { field: value } }) to update one document. Use updateMany(filter, { $set: { status: "updated" } }) to update all documents matching the filter. Log matchedCount and modifiedCount for each. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.update',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Update Operations',
      hints: [
        'updateOne and updateMany take (filter, update). Use $set to change fields without replacing the whole document.',
        'matchedCount is how many documents matched; modifiedCount is how many were actually updated.',
        'Filters use the same syntax as find()—e.g. { name: "Widget" } or { quantity: { $gte: 5 } }.',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-4',
      title: 'Step 4: Replace a Document with replaceOne',
      narrative:
        'replaceOne(filter, replacement) replaces the first document matching the filter with the replacement document. Unlike updateOne with $set, the entire document is replaced; the replacement must contain all fields you want to keep. Use replaceOne when you want a full document swap.',
      instructions:
        'Use replaceOne(filter, { _id: sameId, name: "NewName", quantity: 99 }) to replace one document. The replacement document should include _id (or omit it to let MongoDB keep the existing _id). Log matchedCount and modifiedCount. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.replace-one',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Update Operations',
      hints: [
        'replaceOne(filter, replacement) takes a full document as the second argument, not update operators.',
        'Include _id in the replacement to keep the same _id; otherwise a new _id can be generated in some cases.',
        'matchedCount and modifiedCount indicate whether a document was found and replaced.',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-5',
      title: 'Step 5: Upserts (update or insert)',
      narrative:
        'An upsert is an update with { upsert: true }. If at least one document matches the filter, MongoDB updates it (or them, for updateMany). If no document matches, MongoDB inserts one: for updateOne/updateMany the new document is built from the filter and the update document (e.g. $set); for replaceOne the replacement document is inserted. The result includes upsertedId when an insert happened. Upserts are useful for "set if exists, create if not" patterns.',
      instructions:
        'Use updateOne(filter, { $set: { name: "Upserted", value: 1 } }, { upsert: true }). If no document matches the filter, one will be inserted. Log result.upsertedId when present and result.matchedCount/result.modifiedCount. Try with a filter that matches nothing first, then with one that matches. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.upsert',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Update Operations',
      hints: [
        'Pass { upsert: true } as the third argument to updateOne(filter, update, options).',
        'When no document matches, result.upsertedId is set; when one matches and is updated, result.modifiedCount is 1.',
        'The inserted document combines the filter equality fields with the update document ($set fields).',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-6',
      title: 'Step 6: Delete with deleteOne and deleteMany',
      narrative:
        'Delete operations remove documents. deleteOne(filter) removes the first document matching the filter; deleteMany(filter) removes all matching documents. The filter syntax is the same as for find() and update. Always verify your filter to avoid deleting more data than intended. Results include deletedCount.',
      instructions:
        'Use deleteOne(filter) to remove one document (e.g. by _id). Use deleteMany(filter) to remove all documents matching a condition (e.g. { status: "temporary" }). Log deletedCount for each. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.delete',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Delete Operations',
      hints: [
        'deleteOne(filter) removes at most one document; deleteMany(filter) removes all matching documents.',
        'Use the same filter syntax as find()—e.g. { _id: id } or { category: "old" }.',
        'deletedCount in the result confirms how many documents were removed.',
      ],
    },
    {
      id: 'lab-mongodb-crud-step-7',
      title: 'Step 7: Batch Operations with bulkWrite',
      narrative:
        'bulkWrite(operations) sends multiple insert, update, replace, or delete operations in a single round trip. Each operation is specified as { insertOne: { document } }, { updateOne: { filter, update } }, { replaceOne: { filter, replacement } }, or { deleteOne: { filter } }. Use ordered: true (default) to stop on first error, or ordered: false to continue and collect all errors.',
      instructions:
        'Build an array of operations: at least one insertOne, one updateOne, and one deleteOne. Call collection.bulkWrite(operations, { ordered: true }). Log the result (insertedCount, modifiedCount, deletedCount). Try ordered: false with a mix of operations. Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'crud.bulk-write',
      sourceProof: 'MongoDB Manual - CRUD',
      sourceSection: 'Bulk Write',
      hints: [
        'Each operation is an object: { insertOne: { document: { ... } } }, { updateOne: { filter: {}, update: { $set: {} } } }, { deleteOne: { filter: {} } }.',
        'ordered: true (default) stops at the first error; ordered: false continues and reports all errors.',
        'Result has insertedCount, modifiedCount, deletedCount, and optionally insertedIds.',
      ],
    },
  ],
};
