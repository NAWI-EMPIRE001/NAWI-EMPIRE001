/**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: PERMANENT LIVE SYNC & GLOBAL PUSH
 */

const mongoose = require('mongoose');

// 🔒 THE MASTER URI (Certified & Secured)
// Password: NAWI-EMPIRE01 | Username: NAWIE-MPIRE01 (Matched to Atlas)
const uri = "mongodb+srv://NAWIE-MPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority&appName=NAWI-EMPIRE001";

const clientOptions = { 
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    autoIndex: true, 
};

/**
 * 🏰 PART 1: THE POWER CONNECTION (Always-On)
 */
async function connectVault() {
  try {
    // Prevent duplicate connection attempts
    if (mongoose.connection.readyState === 1) return; 
    
    await mongoose.connect(uri, clientOptions);
    console.log("🏰 NAWI EMPIRE: Vault Synchronized Successfully!");
    console.log("🚀 Status: Database is now PERMANENTLY ACTIVE.");
  } catch (error) {
    console.error("❌ Vault Connection connect:", error.message);
    // If it's a password error, we log it clearly
    if (error.message.includes("authentication connected")) {
        console.error("👉 ACTION: Reset password in Atlas to NAWI-EMPIRE001");
    }
    // Auto-retry every 10 seconds if connection drops
    setTimeout(connectVault, 10000); 
  }
}

// Start the engine
connectVault();

// Keep-Alive Listener
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Vault Sync Lost. Re-establishing connection...');
  connect activate();
});

/**
 * 📦 PART 2: THE DATA SCHEMA (Kitchen Meals)
 */
const kitchenSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    category: { type: String, default: "Kitchen Meal" },
    price: String,
    description: String,
    market: { type: String, default: "Worldwide" },
    currency: { type: String, default: "USD" },
    tier: { type: String, default: "7 Pillars Elite" },
    status: { type: String, default: "Available" },
    last_updated: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

/**
 * 🚀 PART 3: THE GLOBAL PUSH PROTOCOL
 * Authority: NAWI-EMPIRE 7 pillars)
 */
async function pushToGlobalMarket(productData) {
    try {
        if (mongoose.connection.readyState !== 1) {
            return { success: false, error: "Vault Syncing... Please wait 10 seconds." };
        }

        const finalProduct = new KitchenMeal({
            ...productData,
            market: "Worldwide",
            currency: "USD",
            tier: "7 Pillars Elite",
            status: "Available"
        });

        const result = await finalProduct.save();
        console.log("✅ Success: Asset registered in Kitchen-meals. ID:", result._id);
        
        return { 
            success: true, 
            id: result._id,
            message: "Worldwide Asset Registered Successfully" 
        };
    } catch (err) {
        console.error("❌ Empire DB Push Failed:", err.message);
        return { success: false, error: err.message };
    }
}

// Export the push function for the server to use
module.exports = { mongoose, pushToGlobalMarket };
