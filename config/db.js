// ======================================================
// 👑 NAWI-EMPIRE001 DATABASE CONFIGURATION MATRIX
// FILE: config/db.js
// ======================================================

const mongoose = require('mongoose');

// The exact production URI string provided by your MongoDB Atlas cluster
const ATLAS_PRODUCTION_URI = "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/?appName=NAWI-EMPIRE001";

const connectDB = async () => {
  // Uses Render Environment Variables first; falls back safely to your verified production string
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || ATLAS_PRODUCTION_URI;

  try {
    // Establish a persistent, non-closing pool connection for the 7-Pillar system
    await mongoose.connect(uri);
    
    console.log('==========================================================================');
    console.log('📂 DATABASE CONFIGURATION SYNCHRONIZED: NAWI_DB PIPELINE SYSTEM ONLINE');
    console.log('==========================================================================');
  } catch (err) {
    console.error('==========================================================================');
    console.error('[CRITICAL CORRUPTION]: Database operational connection aborted:', err.message);
    console.error('==========================================================================');
    process.exit(1); // Force graceful restart on failure to clear port binding lockouts
  }
};

module.exports = connectDB;
