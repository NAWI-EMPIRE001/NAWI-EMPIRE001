const Meal = require('../models/Meal');
const User = require('../models/User');

/**
 * ==========================================
 * CREATE MEAL
 * ==========================================
 */
exports.createMeal = async (req, res) => {
    try {

        const seller = await User.findById(req.user.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller account not found.'
            });
        }

        const meal = await Meal.create({
            seller_id: seller._id,
            ...req.body
        });

        return res.status(201).json({
            success: true,
            message: 'Meal successfully created.',
            meal
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * ==========================================
 * GET ALL MEALS
 * ==========================================
 */
exports.getMeals = async (req, res) => {

    try {

        const meals = await Meal.find()
            .populate('seller_id', 'userId email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: meals.length,
            meals
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * GET SINGLE MEAL
 * ==========================================
 */
exports.getMeal = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id)
            .populate('seller_id', 'userId email');

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        return res.status(200).json({
            success: true,
            meal
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * UPDATE MEAL
 * ==========================================
 */
exports.updateMeal = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        if (
            meal.seller_id.toString() !== req.user.id &&
            !req.user.isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        const updatedMeal = await Meal.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Meal updated successfully.',
            meal: updatedMeal
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * DELETE MEAL
 * ==========================================
 */
exports.deleteMeal = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        if (
            meal.seller_id.toString() !== req.user.id &&
            !req.user.isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        await meal.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Meal deleted successfully.'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * FEATURE IN LIVE STUDIO
 * ==========================================
 */
exports.featureInLiveStudio = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        meal.live_studio.is_live_featured = true;

        if (req.body.live_stream_id) {
            meal.live_studio.live_stream_id =
                req.body.live_stream_id;
        }

        if (req.body.chef_name) {
            meal.live_studio.chef_name =
                req.body.chef_name;
        }

        await meal.save();

        return res.status(200).json({
            success: true,
            message: 'Meal featured in Culinary Matrix Live Studio.',
            meal
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * PROMOTE THROUGH VISIBILITY ENGINE
 * ==========================================
 */
exports.promoteMeal = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        meal.visibility_engine.promoted = true;

        if (req.body.ad_campaign_id) {
            meal.visibility_engine.ad_campaign_id =
                req.body.ad_campaign_id;
        }

        await meal.save();

        return res.status(200).json({
            success: true,
            message: 'Meal promoted successfully.',
            meal
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * UPDATE INVENTORY
 * ==========================================
 */
exports.updateInventory = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        meal.inventory.quantity_available =
            req.body.quantity_available;

        meal.inventory.low_stock_alert =
            req.body.quantity_available < 10;

        await meal.save();

        return res.status(200).json({
            success: true,
            message: 'Inventory updated.',
            inventory: meal.inventory
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/**
 * ==========================================
 * RATE MEAL
 * ==========================================
 */
exports.rateMeal = async (req, res) => {

    try {

        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found.'
            });
        }

        const rating = Number(req.body.rating);

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5.'
            });
        }

        const totalReviews =
            meal.ratings.total_reviews + 1;

        const totalScore =
            (meal.ratings.average_rating *
                meal.ratings.total_reviews) +
            rating;

        meal.ratings.average_rating =
            totalScore / totalReviews;

        meal.ratings.total_reviews =
            totalReviews;

        await meal.save();

        return res.status(200).json({
            success: true,
            message: 'Rating submitted.',
            ratings: meal.ratings
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
