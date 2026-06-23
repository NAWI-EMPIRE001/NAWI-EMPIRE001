// services/kitchenService.js
const mongoose = require('mongoose');
let MealImport;
try {
  MealImport = require('../module/meal');
} catch (error) {
  console.error('❌ Meal model could not be loaded:', error.message);
  throw error;
}

// Safely extract the model constructor whether it is exported directly or as an object property
const Meal = (MealImport && (MealImport.model || MealImport.Meal)) || (typeof MealImport === 'function' ? MealImport : null);

if (!Meal) {
  throw new Error('❌ Failed to resolve Meal model constructor from module/meal.js');
}

/**
 * pushToGlobalMarket
 * - Expects mealData with keys:
 *    seller_id (ObjectId or valid id),
 *    product_name (string),
 *    description (string),
 *    price (number),
 *    category (string),
 *    currency (string) optional,
 *    images (array of strings) optional,
 *    quantity_available (number) optional
 */
const pushToGlobalMarket = async (mealData = {}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection unavailable.');
    }

    const requiredFields = ['seller_id', 'product_name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter((f) => !mealData[f]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const newMeal = new Meal({
      seller_id: mealData.seller_id,
      product_name: mealData.product_name,
      category: mealData.category || 'Kitchen Meal',
      description: mealData.description,
      images: Array.isArray(mealData.images) ? mealData.images : [],
      price: mealData.price,
      currency: mealData.currency || 'EC',
      trust_and_security: {
        audit_status: mealData.audit_status || 'PENDING_AUDIT',
        is_verified_seller: mealData.is_verified_seller || false,
        safety_clearance: mealData.safety_clearance || 'PENDING'
      },
      inventory: {
        quantity_available: typeof mealData.quantity_available === 'number' ? mealData.quantity_available : 0,
        low_stock_alert: !!mealData.low_stock_alert
      },
      forensic_stamp: {
        isForensicStamped: typeof mealData.isForensicStamped === 'boolean' ? mealData.isForensicStamped : true,
        assetFingerprint: mealData.assetFingerprint || ''
      }
    });

    const savedMeal = await newMeal.save();
    console.log(`✨ MARKET ENTRY CREATED: ${savedMeal.product_name}`);

    return {
      success: true,
      message: 'Asset submitted for audit.',
      mealId: savedMeal._id,
      asset: savedMeal
    };
  } catch (error) {
    console.error('❌ MARKET ENTRY ERROR:', error);
    return {
      success: false,
      message: 'Marketplace submission failed.',
      error: error
    };
  }
};

module.exports = {
  KitchenMeal: Meal,
  pushToGlobalMarket
};
