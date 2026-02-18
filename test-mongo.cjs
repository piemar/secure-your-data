const { MongoClient } = require('mongodb');

// Decoded URI from vite.config.ts
const uri = "mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0";
const dbName = "csfleqe";

async function testConnection() {
    const client = new MongoClient(uri);
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(' - ' + c.name));

        const leaderboard = db.collection('leaderboard');
        const count = await leaderboard.countDocuments();
        console.log('Documents in leaderboard collection: ' + count);

        const pointsColl = db.collection('points');
        const pointsCount = await pointsColl.countDocuments();
        console.log('Documents in points collection: ' + pointsCount);

        const email = "test_upsert_fixed@example.com";
        const updates = { score: 100 };

        console.log('Testing FIXED findOneAndUpdate for ' + email);

        const defaultInit = {
            score: 0,
            completedLabs: [],
            labTimes: {},
            hintsUsed: 0,
            solutionsRevealed: 0
        };

        const finalSetOnInsert = { email };
        Object.keys(defaultInit).forEach(key => {
            if (updates[key] === undefined) {
                finalSetOnInsert[key] = defaultInit[key];
            }
        });

        const result = await leaderboard.findOneAndUpdate(
            { email },
            {
                $set: { ...updates, lastActive: Date.now() },
                $setOnInsert: finalSetOnInsert
            },
            { upsert: true, returnDocument: 'after' }
        );
        console.log('Result status:', result ? 'Success' : 'Failed');
        console.log('Result value:', JSON.stringify(result, null, 2));

        const finalCount = await leaderboard.countDocuments();
        console.log('Final documents in leaderboard collection: ' + finalCount);

        const entries = await leaderboard.find({}).toArray();
        console.log('Leaderboard entries:');
        console.log(JSON.stringify(entries, null, 2));

    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await client.close();
    }
}

testConnection();
