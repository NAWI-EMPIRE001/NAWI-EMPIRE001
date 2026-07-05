const User = require('../models/User');
const Product = require('../models/Product');
const Meal = require('../models/Meal');
const Stream = require('../models/Stream');

exports.globalSearch = async (req, res) => {

    try {

        const query = req.query.q;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }

        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        }).limit(10);

        const products = Product
            ? await Product.find({
                title: { $regex: query, $options: 'i' }
            }).limit(10)
            : [];

        const meals = Meal
            ? await Meal.find({
                mealName: { $regex: query, $options: 'i' }
            }).limit(10)
            : [];

        const streams = Stream
            ? await Stream.find({
                title: { $regex: query, $options: 'i' }
            }).limit(10)
            : [];

        res.json({
            success: true,
            users,
            products,
            meals,
            streams
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};