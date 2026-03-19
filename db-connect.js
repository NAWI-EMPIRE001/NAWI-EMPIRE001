 /**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: ACTIVE SOVEREIGN CONNECTION
 */

const mongoose = require('mongoose');

// We use the Schema already defined in your system to ensure data integrity
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

// Link to the specific "Kitchen-meals" collection in your NAWI_DB
const KitchenMeal = mongoose.model('KitchenMeal', kitchenSchema, 'Kitchen-meals');

/**
 * Pushes new assets directly to the Global Market
 * Authority: NAWI-EMPIRE CEO
 */
async function pushToGlobalMarket(productData) {
    try {
        // Check if we are already connected via server.js
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Vault Connection Offline. Ensure server.js is running.");
        }

        const finalProduct = new KitchenMeal({
            ...productData,
            market: "Worldwide",
            currency: "USD",
            tier: "7 Pillars Elite"
        });

        const result = await finalProduct.save();
        console.log("✅ Success: Asset pushed to Kitchen-meals. ID:", result._id);
        
        return { 
            success: true, 
            id: result._id,
            message: "Worldwide Asset Registered" 
        };

    } catch (err) {
        console.error("❌ Empire DB Push Failed:", err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { pushToGlobalMarket };
