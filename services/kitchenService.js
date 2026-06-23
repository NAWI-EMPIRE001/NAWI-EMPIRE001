// ======================================================
// NAWI-EMPIRE001 KITCHEN SERVICE
// FILE: services/kitchenService.js
// System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
// ======================================================

const mongoose = require('mongoose');
let Meal;

try {
    // Synchronized cleanly with your lowercase folder layout structure
    Meal = require('../module/meal');
} catch (error) {
    console.error('❌ Meal model could not be loaded into Kitchen Service:', error.message);
    throw error;
}

class KitchenService {

    /**
     * PUSH MEAL TO GLOBAL MARKET
     * Merged securely from legacy nodes to prevent data flow drops
     */
    static async pushToGlobalMarket(mealData = {}) {
        try {
            // Verify active MongoDB connection pool status
            if (mongoose.connection.readyState !== 1) {
                throw new Error('Database connection unavailable.');
            }

            // Required field validation checks
            const requiredFields = ['sellerId', 'mealName', 'description', 'price', 'category'];
            const missingFields = requiredFields.filter(field => !mealData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create marketplace record matching Empire data structures
            const newMeal = new Meal({
                sellerId: mealData.sellerId,
                mealName: mealData.mealName,
                origin: mealData.origin || 'Global',
                description: mealData.description,
                price: mealData.price,
                currency: mealData.currency || 'Empire Coins',
                category: mealData.category,
                images: Array.isArray(mealData.images) ? mealData.images : [],
                status: 'PENDING_AUDIT'
            });

            const savedMeal = await newMeal.save();
            console.log(`✨ MARKET ENTRY CREATED VIA SERVICE: ${savedMeal.mealName}`);

            return {
                success: true,
                message: 'Asset submitted for audit.',
                mealId: savedMeal._id,
                asset: savedMeal
            };

        } catch (error) {
            console.error('❌ MARKET ENTRY ERROR IN SERVICE:', error.message);
            return {
                success: false,
                message: 'Marketplace submission failed.',
                error: error.message
            };
        }
    }

    /**
     * CREATE MEAL LISTING (Standard Class Flow)
     */
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

    /**
     * GET ALL APPROVED MEALS
     */
    static async getApprovedMeals() {
        return await Meal.find({ status: 'APPROVED' })
            .sort({ createdAt: -1 });
    }

    /**
     * APPROVE MEAL LISTING
     */
    static async approveMeal(mealId) {
        const meal = await Meal.findById(mealId);
        if (!meal) throw new Error('Meal not found');

        meal.status = 'APPROVED';
        await meal.save();
        return meal;
    }

    /**
     * REJECT MEAL LISTING
     */
    static async rejectMeal(mealId) {
        const meal = await Meal.findById(mealId);
        if (!meal) throw new Error('Meal not found');

        meal.status = 'REJECTED';
        await meal.save();
        return meal;
    }
}

// Map compatibility exports so both old controller imports and new class handlers work seamlessly
module.exports = {
    KitchenService,
    KitchenMeal: Meal,
    pushToGlobalMarket: KitchenService.pushToGlobalMarket
};
