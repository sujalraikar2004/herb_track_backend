import Farmer from "../models/farmer.model.js";
import Supplier from "../models/supplier.model.js";
import Industry from "../models/industry.model.js";
import Consumer from "../models/consumer.model.js";

/**
 * Get the appropriate model based on user role
 * @param {string} role - User role (farmer, supplier, industry, consumer)
 * @returns {Model} - Mongoose model
 */
export const getModelByRole = (role) => {
    const models = {
        farmer: Farmer,
        supplier: Supplier,
        industry: Industry,
        consumer: Consumer,
    };

    const model = models[role.toLowerCase()];
    if (!model) {
        throw new Error(`Invalid role: ${role}`);
    }

    return model;
};

/**
 * Get all user models
 * @returns {Array} - Array of all user models
 */
export const getAllUserModels = () => {
    return [Farmer, Supplier, Industry, Consumer];
};

/**
 * Find user by phone across all models
 * @param {string} phone - Phone number
 * @returns {Object|null} - User object with role or null
 */
export const findUserByPhone = async (phone) => {
    const models = [
        { model: Farmer, role: "farmer" },
        { model: Supplier, role: "supplier" },
        { model: Industry, role: "industry" },
        { model: Consumer, role: "consumer" },
    ];

    for (const { model, role } of models) {
        const user = await model.findOne({ phone });
        if (user) {
            return { user, role };
        }
    }

    return null;
};
