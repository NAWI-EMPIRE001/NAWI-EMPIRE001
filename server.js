const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the Vault using the link from Render's Environment
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log("✅ NAWI EMPIRE VAULT: CONNECTED"))
    .catch((err) => console.log("❌ DATABASE ERROR:", err));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Automatic system to find your pages (live, market, etc.)
app.get('*', (req, res) => {
    let page = req.params[0].replace('/', '');
    if (!page.includes('.')) page += '.html';
    res.sendFile(path.join(__dirname, page), (err) => {
        if (err) res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`EMPIRE ENGINE ONLINE ON PORT ${PORT}`);
});