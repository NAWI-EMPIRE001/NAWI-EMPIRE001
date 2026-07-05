/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: models/Product.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Description: High-performance unified architectural product matrix governing all 7 Pillars.
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // ========================================================
    // 🛡️ SECURITY, PLATFORM WATERMARK & ACCESS AUTHORIZATION
    // ========================================================
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true
    },
    creator_id: { 
        type: String, 
        required: true,
        index: true
        // Identifies the uploading citizen profile. "NAWI-EMPIRE001" bypasses standard audit.
    },
    isForensicStamped: {
        type: Boolean,
        default: false
        // Mandatory Forensic Stamping for Diamondback Forge and high-tier master assets
    },

    // ========================================================
    // 🔀 THE GUARDRAIL: THE 7 CORE ARCHITECTURAL PILLARS
    // ========================================================
    pillar_tool: {
        type: String,
        required: true,
        index: true,
        enum: [
            'ARENA_NODE',          // 🎮 Pillar 1: Vanguard Gaming Axis
            'SOVEREIGN_EXCHANGE',  // 💼 Pillar 2: Global Marketplace
            'VISIBILITY_ENGINE',   // 📢 Pillar 3: Ads Program Manager
            'CULINARY_MATRIX',     // 🍳 Pillar 4: Kitchen Meal Node
            'AESTHETIC_NEXUS',     // ✂️ Pillar 5: Sovereign Stylist / Cosmetics
            'DIAMONDBACK_FORGE',   // 💎 Pillar 6: Apparel Studio & Frameworks
            'SONIC_LEDGER'         // 🎵 Pillar 7: Global Music Hub
        ]
    },

    // ========================================================
    // 📦 CORE POST, ITEM, AND MEDIA STRUCTURE
    // ========================================================
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1000 },
    category_feed_target: { 
        type: String, 
        required: true,
        enum: ['Content Feed Only', 'Marketplace Only', 'Universal Feed']
        // Controls routing across target ecosystem nodes
    },
    
    // Cross-platform media components supporting mobile image carousels and studio session tracks
    media_assets: [{
        asset_id: { type: String, required: true },
        file_url: { type: String, required: true },
        media_type: { type: String, enum: ['IMAGE', 'VIDEO', 'AUDIO', '3D_SOURCE_ZIP'], required: true },
        is_downloadable_to_phone: { type: Boolean, default: false }, // Mandatory for Sonic Ledger track downloading
        download_watermark_seal: { type: String, default: "NAWI-EMPIRE001-SECURE-MEDIA" }
    }],

    // ========================================================
    // 🪙 THE COIN ENGINE, REAL-TIME SYNC & ESCROW RULES
    // ========================================================
    pricing: {
        base_price: { type: Number, default: 0.00, min: 0.00 }, // 0 balance means free live studio session/post
        currency: { type: String, enum: ['EMPIRE_COINS', 'USD', 'NGN', 'GBP', 'EUR'], default: "EMPIRE_COINS" },
        currency_support: { type: [String], enum: ["EMPIRE_COINS", "USD", "NGN", "GBP", "EUR"], default: ["EMPIRE_COINS", "USD", "NGN", "GBP", "EUR"] },
        stock_quantity: { type: Number, default: 1, min: 0 }, // Available units for sale
        transaction_type: { type: String, enum: ['FREE_ACCESS', 'DIRECT_PURCHASE', 'P2P_ESCROW', 'GIFT_SUPPORT'], default: 'FREE_ACCESS' },
        stock_status: { type: String, enum: ['In Stock', 'AVAILABLE', 'OUT_OF_STOCK', 'LIVE_STUDIO_SESSION'], default: 'AVAILABLE' },
        
        // WebSocket and Diamondback 231 Escrow Shield Tracking Extensions
        escrow_holding_balance: { type: Number, default: 0.00, min: 0.00 },
        requires_websocket_sync: { type: Boolean, default: false }
    },

    // ========================================================
    // ⚡ THE 7 PILLARS SPECIFIC COMPONENT LOGIC
    // ========================================================
    
    // 🎮 Pillar 1: Arena Node (Vanguard Gaming Axis)
    arena_node_metadata: {
        game_title: { type: String, default: "" },
        opponent_username: { type: String, default: "" },
        battle_winner_id: { type: String, default: "" },
        wager_protocol_enforced: { type: String, default: "XP_AND_RANK_ONLY", immutable: true }, // Absolutely NO money betting
        battle_clip_duration_secs: { type: Number, default: 0 }
    },

    // 💼 Pillar 2: The Sovereign Exchange (Global Marketplace)
    sovereign_exchange_metadata: {
        escrow_shield_enabled: { type: Boolean, default: true },
        asset_value_tag: { type: String, default: "STANDARD_TIER" },
        delivery_type: { type: String, enum: ['PHYSICAL_CARGO', 'DIGITAL_DISPATCH'], default: 'DIGITAL_DISPATCH' }
    },

    // 📢 Pillar 3: The Visibility Engine (Ads Program Manager)
    visibility_engine_metadata: {
        boost_enabled: { type: Boolean, default: false },
        ad_campaign_budget_coins: { type: Number, default: 0 },
        target_demographic_pillar: { type: String, default: "ALL_TOOLS" },
        fixed_price_slot_package: { type: String, default: "" }, // e.g., "7-Day Main Stage Banner Space"
        impressions_logged: { type: Number, default: 0 },
        clicks_logged: { type: Number, default: 0 }
    },

    // 🍳 Pillar 4: The Culinary Matrix (Kitchen Meal Node)
    culinary_matrix_metadata: {
        meal_shop_name: { type: String, default: "" },
        live_studio_scheduled: { type: Boolean, default: false },
        rtmp_endpoint_url: { type: String, default: "" },
        menu_ingredients_labels: { type: [String], default: [] } // e.g., ["Spices", "Vegan", "Cooked"]
    },

    // ✂️ Pillar 5: The Aesthetic Nexus (Sovereign Stylist / Cosmetics)
    aesthetic_nexus_metadata: {
        tool_type: { type: String, enum: ['Barbershop_Tools', 'Cosmetics', 'Baby_Fashion_Tools', 'Style_Lookbook', 'None'], default: 'None' },
        portfolio_gallery_urls: { type: [String], default: [] },
        booking_fee_coins: { type: Number, default: 0 },
        vip_reservation_enabled: { type: Boolean, default: false }
    },

    // 💎 Pillar 6: The Diamondback Forge (Apparel Studio & Frameworks)
    diamondback_forge_metadata: {
        framework_version: { type: String, default: "DIAMONDBACK-231-V1" },
        allowed_extensions: { type: [String], default: [".obj", ".fbx", ".blend", ".zip", ".rar", ".pdf"] },
        target_demographic: { type: String, enum: ['Men', 'Women', 'Children', 'Universal', 'None'], default: 'Universal' },
        available_sizes: { type: [String], default: [] }, // e.g., ["S", "M", "L", "XL"]
        corporate_license_tier: { type: String, default: "COMMERCIAL_USE_BLUEPRINT" }
    },

    // 🎵 Pillar 7: The Sonic Ledger (Global Music Hub)
    sonic_ledger_metadata: {
        artist_name: { type: String, default: "" },
        lyrics_display: { type: String, default: "" },
        track_duration_secs: { type: Number, default: 0 },
        total_stream_plays: { type: Number, default: 0 },
        total_device_downloads: { type: Number, default: 0 },
        multimedia_licensing_available: { type: Boolean, default: false }
    },

    // ========================================================
    // 🛡️ ANTI-SCAM SYSTEM COMPLIANCE GATES
    // ========================================================
    trust_and_security: {
        is_verified_seller: { type: Boolean, default: false },
        safety_clearance_hash: { type: String, default: "PASSED" },
        audit_status: { type: String, enum: ['PENDING_AUDIT', 'APPROVED', 'REJECTED'], default: 'PENDING_AUDIT', index: true }
    }
}, { 
    collection: 'marketplace_products', 
    timestamps: true 
});

// Compound indices optimized for lighting-fast ecosystem routing
ProductSchema.index({ pillar_tool: 1, 'trust_and_security.audit_status': 1 });
ProductSchema.index({ creator_id: 1, createdAt: -1 });

// Middleware security synchronization layer
ProductSchema.pre('save', function (next) {
    // Force Forensic Stamping validation if items originate from Diamondback Forge frameworks
    if (this.pillar_tool === 'DIAMONDBACK_FORGE') {
        this.isForensicStamped = true;
    }

    // Automatically trip WebSocket state sync flags if an active escrow operation updates balances
    if (this.isModified('pricing.escrow_holding_balance')) {
        this.pricing.requires_websocket_sync = true;
    } else {
        this.pricing.requires_websocket_sync = false;
    }

    next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
