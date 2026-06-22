// ======================================================
// NAWI-EMPIRE001 KITCHEN SERVICE
// FILE: services/kitchenService.js
// ======================================================

const Meal = require('../models/Meal');

class KitchenService {

    // Create Meal Listing
    static async createMeal(data) {

        const meal = await Meal.create({
            sellerId: data.sellerId,
            mealName: data.mealName,
            origin: data.origin || 'Global',
            description: data.description,
            price: data.price,
            currency: 'EMPIRE_COINS',
            category: data.category,
            images: data.images || [],
            status: 'PENDING_AUDIT'
        });

        return meal;
    }

    // Get all approved meals
    static async getApprovedMeals() {

        return await Meal.find({
            status: 'APPROVED'
        })
        .sort({ createdAt: -1 });
    }

    // Approve meal listing
    static async approveMeal(mealId) {

        const meal = await Meal.findById(mealId);

        if (!meal)
            throw new Error('Meal not found');

        meal.status = 'APPROVED';

        await meal.save();

        return meal;
    }

    // Reject meal listing
    static async rejectMeal(mealId) {

        const meal = await Meal.findById(mealId);

        if (!meal)
            throw new Error('Meal not found');

        meal.status = 'REJECTED';

        await meal.save();

        return meal;
    }
}

module.exports = KitchenService;