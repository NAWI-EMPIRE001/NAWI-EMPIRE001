// THE APPAREL SCHEMA (server.js)
const ProductSchema = new mongoose.Schema({
    category: { type: String, enum: ['Adult', 'Children', 'Accessories'] },
    itemName: String,
    basePriceNaira: Number,
    coinValue: Number, // Cost in Empire Coins
    sizeOptions: [String],
    imageUrl: String, // The 3D render with the Empire Logo
    isCustomizable: { type: Boolean, default: true },
    stockCount: { type: Number, default: 100 }
});

// THE ORDER GATEWAY (How Citizens Buy)
app.post('/api/order-apparel', async (req, res) => {
    const { userId, productId, size, deliveryAddress } = req.body;
    
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    // 1. Wealth Check
    if (user.empireCoins < product.coinValue) {
        return res.status(400).json({ message: "Insufficient Coins for Imperial Apparel." });
    }

    // 2. The Transaction
    user.empireCoins -= product.coinValue;
    
    // 3. Create the Physical Order Log (For your production team)
    const newOrder = new Order({
        citizenId: userId,
        item: product.itemName,
        specs: size,
        status: 'Manufacturing', // First stage of the logo printing
        address: deliveryAddress
    });

    await user.save();
    await newOrder.save();

    res.json({ success: true, message: "Order Received. The Empire Logo is being applied." });
});
