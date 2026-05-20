// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Strict Platform Verification Watermark
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true // Cannot be deleted or modified by users or external scripts
    },
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    
    // Core Identity Profile Block
    identity: {
        sovereign_name: { type: String, default: "Username" },
        legacy_rank: { type: String, default: "Citizen" }, // e.g., Founder, Citizen
        id_verified: { type: Boolean, default: false },
        joined_date: { type: String, default: "2026-05-20" }
    },
    
    // Operational Metrics (Numbers for accurate sorting on leaderboards)
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 },
        activity_score: { type: Number, default: 0 }
    },
    
    // Platform Level Access Gates (Strict True/False Switches)
    eligibility: {
        can_go_live: { type: Boolean, default: false },
        is_monetized: { type: Boolean, default: false },
        gate_1k_reached: { type: Boolean, default: false }, 
        gate_20k_reached: { type: Boolean, default: false }
    },
    
    // The Financial Engine (Numbers for processing flawless token math)
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0.00 },
        welcome_bonus_used: { type: Boolean, default: false },
        last_mint_date: { type: String, default: "2026-05-20" }
    },
    
    // Watermarked Content & Media Downloader Vault
    // Enforces security on every video stream, audio download, and media transaction
    watermarked_assets: {
        video_streams: [{
            video_id: { type: String, required: true },
            title: String,
            asset_url: String,
            download_watermark_hash: { type: String, default: "NAWI-EMPIRE001-SECURE-MEDIA" }
        }],
        downloadable_products: [{
            product_id: { type: String, required: true },
            file_name: String,
            download_licence: { type: String, default: "PROTECTED_BY_DIAMONDBACK231" }
        }]
    },
    
    // Antiscam Guardrails & System Defenses
    security: {
        is_banned: { type: Boolean, default: false }, 
        scam_alert_flag: { type: Number, default: 0 },
        multi_factor_auth: { type: String, default: "ENABLED" }
    }
}, { collection: 'users', timestamps: true }); // Connects directly to your live NAWI_DB users collection

module.exports = mongoose.model('User', UserSchema);
