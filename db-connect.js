/**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: LEGACY CONNECTION (PERMANENT)
 */

const { MongoClient, ServerApiVersion } = require('mongodb');

// 🔒 Your Secure Permanent Connection String
const uri = "mongodb+srv://NAWIEMPIRE001:NAWI-EMPIRE01@nawi-empire001.zwidxex.mongodb.net/NAWI-EMPIRE?retryWrites=true&w=majority&appName=NAWI-EMPIRE001";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function pushToGlobalMarket(productData) {
    try {
        await client.connect();
        const database = client.db("NAWI-EMPIRE");
        const collection = database.collection("Kitchen-meals");

        // Ensuring the product is marked for the Worldwide Market
        const finalProduct = {
            ...productData,
            market: "Worldwide",
            currency: "USD",
            tier: "7 Pillars Elite",
            last_updated: new Date().toISOString().split('T')[0]
        };

        const result = await collection.insertOne(finalProduct);
        console.log("Success: Product pushed to NAWI-EMPIRE Global Market. ID:", result.insertedId);
        return { success: true, id: result.insertedId };

    } catch (err) {
        console.error("Empire DB Connection Failed:", err);
        return { success: false, error: err.message };
    } finally {
        await client.close();
    }
}

module.exports = { pushToGlobalMarket };
