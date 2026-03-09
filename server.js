const mongoose = require('mongoose');

// This is your direct connection string with the password included
const uri = "mongodb+srv://NAWI-EMPIRE:NAWI-EMPIRE01@nawi-empire01.xhjz2iu.mongodb.net/nawi_database?retryWrites=true&w=majority";

// Connect to the NAWI-EMPIRE Database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ NAWI-EMPIRE Database don connect successfully!");
  console.log("Platform is now MOVING 🚀");
})
.catch((err) => {
  console.error("❌ Still getting error:", err.message);
  console.log("Check if your IP address is whitelisted for MongoDB Atlas.");
});

// This part makes sure your connection doesn't drop
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // We are live!
});
