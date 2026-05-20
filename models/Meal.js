// models/Meal.js
const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    // Security & Platform Trust Architecture
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true // Cannot be changed or deleted by users
    },
    seller_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Core Product Information
    product_name: { 
        type: String, 
        required: true,
        trim: true 
    },
    category: { 
        type: String, 
        default: "Kitchen Meal",
        enum: ['Kitchen Meal', 'Canteen', 'Local Shop', 'Raw Food', 'Cooked Meal', 'Spices', 'International', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks']
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
        default: "Premium quality selection from NAWI-EMPIRE culinary marketplace."
    },
    price: { 
        type: Number, 
        required: true 
    }, 
    currency: { 
        type: String, 
        default: "🪙 Empire Coins" 
    }, 
    market: { type: String, default: "Worldwide" },
    tier: { type: String, default: "7 Pillars Elite" },
    origin_vault: { type: String, default: "NAWI-EMPIRE001" },
    
    // Interactive Media Assets for Android / iPhone uploads
    images: {
        type: [String],
        default: ['https://via.placeholder.com/300x200?text=Imperial+Meal+Asset']
    },
    
    // Financial Rules, Currencies, and Logistics Modules
    pricing_and_logistics: {
        base_price_usd: { type: Number, required: true },
        currency_support: { type: [String], default: ["USD", "NGN", "GBP", "EUR", "EMPIRE_COINS"] },
        transaction_type: { type: String, default: "P2P Escrow" },
        shipping_scope: { type: String, default: "Worldwide" },
        stock_status: { 
            type: String, 
            enum: ['In Stock', 'AVAILABLE', 'OUT_OF_STOCK'], 
            default: "In Stock" 
        }
    },
    
    // Item Classifications & Specifications
    specifications: {
        volume_weight: { type: String, default: "" },
        packaging: { type: String, default: "" },
        shelf_life: { type: String, default: "" },
        dietary_labels: { type: [String], default: ["Vegan", "Gluten-Free", "Non-GMO"] }
    },
    
    // System Integrity, Audits, and Antiscam Flags
    trust_and_security: {
        is_verified_seller: { type: Boolean, default: true },
        safety_clearance: { type: String, default: "PASSED" },
        audit_status: { 
            type: String, 
            enum: ['PENDING_AUDIT', 'APPROVED', 'REJECTED'], 
            default: 'PENDING_AUDIT' 
        }
    },
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    last_updated: { type: String, default: "2026-05-20" }
}, { collection: 'kitchenmeals' }); // Direct connection route to your live MongoDB collection

module.exports = mongoose.model('Meal', MealSchema);
