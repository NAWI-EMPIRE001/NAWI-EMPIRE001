   const express = require('express');
const cors = require('cors');
const path = require('path');

const { mongoose, pushToGlobalMarket } = require('./db-connect');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

mongoose.connection.once('open', () => {
    console.log("🚀 Empire Engine: High-Level Sync Confirmed.");
});

const productSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    category: String,
    price: String,
    sku: String,
    origin_country: { type: String, default: "Global Empire" }, 
    market: { type: String, default: "Worldwide" },
    description: String,
    currency: { type: String, default: "USD" },
    status: { type: String, default: "Active" },
    timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema, 'products');

app.get('/health', (req, res) => { res.status(200).send('Empire Active'); });

app.get('/api/get-products', async (req, res) => {
    try {
        const products = await Product.find().sort({ timestamp: -1 }); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

app.post('/api/add-product', async (req, res) => {
    try {
        const result = await pushToGlobalMarket(req.body);
        if (result.success) {
            res.status(201).json({ success: true, message: "Worldwide Asset Registered" });
        } else {
            throw new Error(result.error);
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Vault Entry Failed: " + err.message });
    }
});

const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Empire Engine Active on Port ${PORT}`);
});
