const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const path = require('path');
const app = express();

// 1. Corrected URI with your real password integrated
const uri = "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // 2. Connect and STAY connected
    await client.connect();
    const database = client.db("NAWI-EMPIRE");
    console.log("Pinged your deployment. NAWI EMPIRE Engine is LIVE!");

    // 3. This pipe sends your Movies/Posts to the Professional Feed
    app.get('/api/posts', async (req, res) => {
      try {
        const posts = await database.collection("Movies").find({}).toArray();
        res.json(posts);
      } catch (err) {
        res.status(500).send("Database Error");
      }
    });

    // 4. This pipe sends the 7 Pillars (Ads, Market, etc.)
    app.get('/api/tools', async (req, res) => {
      const tools = await database.collection("Tools").find({}).toArray();
      res.json(tools);
    });

  } catch (error) {
    console.error("Engine failure:", error);
  }
  // CRITICAL: The 'finally { client.close() }' block is REMOVED so the app never dies.
}

run().catch(console.dir);

// Serve your index.html and professional style files
app.use(express.static(path.join(__dirname, '/')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The Empire is running on port ${PORT}`);
});
