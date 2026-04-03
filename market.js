// THE MARKETPLACE SCHEMA (server.js)
const ProductSchema = new mongoose.Schema({
    sellerId: String,
    title: String,
    description: String,
    priceInCoins: Number,
    category: { type: String, enum: ['Real Estate', 'Apparel', 'Electronics', 'Art'] },
    stock: { type: Number, default: 1 },
    status: { type: String, default: 'Available' }
});

// THE ESCROW PAYMENT SYSTEM (Safe Money)
app.post('/api/market/buy-item', async (req, res) => {
    const { buyerId, productId } = req.body;
    
    const buyer = await User.findById(buyerId);
    const product = await Product.findById(productId);
    const seller = await User.findById(product.sellerId);

    // 1. Check Funds
    if (buyer.empireCoins < product.priceInCoins) {
        return res.status(400).json({ message: "Insufficient Coins in Vault." });
    }

    // 2. Lock Funds in Escrow (The Empire holds the money)
    buyer.empireCoins -= product.priceInCoins;
    
    const newTransaction = new Transaction({
        buyerId,
        sellerId: product.sellerId,
        amount: product.priceInCoins,
        status: 'PENDING_DELIVERY', // Money is safe with the Empire
        timestamp: new Date()
    });

    await buyer.save();
    await newTransaction.save();

    res.json({ success: true, message: "Funds held in Empire Escrow. Seller notified." });
});
