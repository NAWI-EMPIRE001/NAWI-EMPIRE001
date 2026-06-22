const mongoose = require('mongoose');
const Meal = require('./models/Meal'); 

// 🛡️ REUSE SINGLE CONNECTION LOGIC
// Connection initialization has been completely offloaded to db.js to prevent duplicate string loops.

// --- 🥘 KITCHEN & MARKETPLACE LOGIC ---

async function pushToGlobalMarket(mealData) {
    try {
        // Ensure the connection is established before saving
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database connection is not open. Operational vault locked.");
        }

        const newMeal = new Meal({
            sellerId: mealData.sellerId,
            mealName: mealData.mealName,
            origin: mealData.origin || "Global",
            description: mealData.description,
            price: mealData.price,
            currency: "🪙 Empire Coins",
            category: mealData.category,
            images: mealData.images || [],
            status: 'PENDING_AUDIT'
        });

        const savedMeal = await newMeal.save();
        console.log(`✨ MARKET ENTRY LOGGED: ${savedMeal.mealName}`);
        
        return { 
            success: true, 
            message: "Asset sent to HQ for Audit", 
            mealId: savedMeal._id 
        };
    } catch (error) {
        console.error("❌ MARKET ENTRY ERROR:", error.message);
        return { 
            success: false, 
            message: "Vault Entry Failed", 
            error: error.message 
        };
    }
}

module.exports = {
    mongoose,
    KitchenMeal: Meal, 
    pushToGlobalMarket
};