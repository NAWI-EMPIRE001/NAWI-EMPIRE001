const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// This tells the platform to show your HTML, CSS, and images
app.use(express.static(__dirname));

// This serves your Luxury Mall entrance (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// This starts the Empire's engine
app.listen(PORT, () => {
    console.log(`NAWI-EMPIRE is now Live on Port ${PORT}`);
});