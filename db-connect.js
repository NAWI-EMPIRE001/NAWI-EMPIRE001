// ======================================================
// NAWI-EMPIRE001
// FILE: services/kitchenService.js
// PURPOSE: Kitchen Marketplace Operations
// ======================================================

const mongoose = require('mongoose');

let Meal;

try {

    Meal = require('../models/Meal');

} catch (error) {

    console.error(
        '❌ Meal model could not be loaded:',
        error.message
    );

    throw error;
}

// ======================================================
// PUSH MEAL TO GLOBAL MARKET
// ======================================================

const pushToGlobalMarket = async (mealData = {}) => {

    try {

        // Verify active MongoDB connection
        if (mongoose.connection.readyState !== 1) {

            throw new Error(
                'Database connection unavailable.'
            );
        }

        // Required field validation
        const requiredFields = [
            'sellerId',
            'mealName',
            'description',
            'price',
            'category'
        ];

        const missingFields = requiredFields.filter(
            field => !mealData[field]
        );

        if (missingFields.length > 0) {

            throw new Error(
                `Missing required fields: ${missingFields.join(', ')}`
            );
        }

        // Create marketplace record
        const newMeal = new Meal({

            sellerId: mealData.sellerId,

            mealName: mealData.mealName,

            origin: mealData.origin || 'Global',

            description: mealData.description,

            price: mealData.price,

            currency: mealData.currency || 'Empire Coins',

            category: mealData.category,

            images: Array.isArray(mealData.images)
                ? mealData.images
                : [],

            status: 'PENDING_AUDIT'
        });

        const savedMeal = await newMeal.save();

        console.log(
            `✨ MARKET ENTRY CREATED: ${savedMeal.mealName}`
        );

        return {

            success: true,

            message: 'Asset submitted for audit.',

            mealId: savedMeal._id,

            asset: savedMeal
        };

    } catch (error) {

        console.error(
            '❌ MARKET ENTRY ERROR:',
            error.message
        );

        return {

            success: false,

            message: 'Marketplace submission failed.',

            error: error.message
        };
    }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    KitchenMeal: Meal,

    pushToGlobalMarket
};