const mongoose = require('mongoose');

/**
 * NAWI-EMPIRE Post Schema
 * Unified for the Aurora-231 Ecosystem
 */
const PostSchema = new mongoose.Schema({
    // 🛡️ AUTHORITY & IDENTITY
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    authorName: { type: String, required: true },
    isMasterPost: { type: Boolean, default: false }, // CEO/Founder Level Authority
    isVerified: { type: Boolean, default: false }, // The "Gold" check for verified merchants

    // 🏛️ THE 7 PILLARS STRUCTURE
    pillarOrigin: { 
        type: Number, 
        enum: [0, 1, 2, 3, 4, 5, 6, 7], 
        default: 0 
    },
    contentType: { 
        type: String, 
        enum: ['General', 'Sovereign_Stylist', 'Empire_Announcement', 'Sponsored_Ad', '3D_Render'],
        default: 'General' 
    },

    // 🖼️ LUXURY CONTENT & ASSETS
    mediaUrl: { type: String, required: true }, // High-res 3D frames or MP4 assets
    caption: { type: String, trim: true, maxLength: 1500 },
    
    // 💰 THE EMPIRE ECONOMY (P2P & Escrow)
    priceInCoins: { type: Number, default: 0 }, 
    giftEarnings: { type: Number, default: 0 }, // Tracks total "7" coins ($0.02 rate)
    p2pEscrowLink: { type: String }, // Direct link for Stylist tool sales

    // 📊 ENGAGEMENT & QUALITY CONTROL
    status: { 
        type: String, 
        enum: ['pending', 'active', 'flagged', 'archived'], 
        default: 'active' 
    },
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    
    // ⏱️ TEMPORAL DATA
    createdAt: { type: Date, default: Date.now }
});

// Optimization for Aurora-231 GCN (Global Content Node)
// Faster indexing for the newest "Empire Announcements" and Pillar-specific feeds
PostSchema.index({ pillarOrigin: 1, createdAt: -1 });
PostSchema.index({ isMasterPost: 1 });

module.exports = mongoose.model('Post', PostSchema);
