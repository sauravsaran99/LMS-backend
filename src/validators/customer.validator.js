const Joi = require("joi");

exports.createCustomerSchema = Joi.object({
    name: Joi.string().trim().min(2).required(),
    phone: Joi.string().trim().min(10).max(15).required(),
    dob: Joi.date().iso().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    address: Joi.string().trim().optional(),
    pincode: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    country: Joi.string().trim().default("India").optional(),
    state_code: Joi.string().trim().optional(),

    // Required ONLY when role = SUPER_ADMIN
    base_branch_id: Joi.number().integer().optional(),
});
