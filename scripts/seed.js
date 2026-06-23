const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    console.log('🌱 Ecosystem seeding initialized...');
    // TODO: add seed logic here (create admin user, sample products, etc.)
    console.log('🌱 No seed actions defined yet. Add seeding steps in scripts/seed.js');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
