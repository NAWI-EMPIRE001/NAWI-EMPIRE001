const mongoose = require('mongoose');

// 🛡️ SOVEREIGN VAULT CONNECTION 
// Loads from Render Environment Variables to keep the Founder's identity secure.
const uri = process.env.MONGODB_URI; 

const clientOptions = { 
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    autoIndex: true, 
};

async function connectVault() {
  try {
    if (mongoose.connection.readyState === 1) return; 
    
    if (!uri) {
        console.error("❌ EMPIRE ERROR: MONGODB_URI is missing in Render Environment Variables!");
        return;
    }

    await mongoose.connect(uri, clientOptions);
    console.log("🏰 NAWI EMPIRE: Vault Synchronized Successfully!");
  } catch (error) {
    console.error("⚠️ EMPIRE SYNC FAILURE:", error.message);
    setTimeout(connectVault, 5000); // Re-attempt connection if it fails
  }
}

// Start the connection
connectVault();

// 📂 THE GLOBAL MARKET SCHEMA
const kitchenSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    price: String,
    tier: { type: String, default: "7 Pillars Elite" },
    category: String,
    description: String
});

// Syncing with the specific 'Kitchen-meals' collection in the Vault
const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

// 🚀 MASTER PUSH FUNCTION
async function pushToGlobalMarket(productData) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectVault(); // Ensure we are connected before pushing
        }
        const finalProduct = new KitchenMeal(productData);
        const result = await finalProduct.save();
        console.log("✅ ASSET DEPLOYED:", result.product_name);
        return { success: true, id: result._id };
    } catch (err) {
        console.error("❌ DEPLOYMENT FAILED:", err.message);
        return { success: false, error: err.message };
    }
}

// Exporting both the connection and the push function for the Vendor Command
module.exports = { mongoose, pushToGlobalMarket };
