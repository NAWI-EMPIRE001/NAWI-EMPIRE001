const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// This connects to the variable you just saved in Render
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log("✅ NAWI EMPIRE: VAULT CONNECTED"))
    .catch((err) => console.log("❌ CONNECTION ERROR:", err));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Auto-finds pages like market.html or live.html
app.get('*', (req, res) => {
    let page = req.params[0].replace('/', '');
    if (!page.includes('.')) page += '.html';
    res.sendFile(path.join(__dirname, page), (err) => {
        if (err) res.redirect('/');
    });
});

app.listen(process.env.PORT || 3000);