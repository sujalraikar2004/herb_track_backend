// src/validations/productValidation.js
const Joi = require('joi');

const priceRangeSchema = Joi.object({
  min: Joi.number().required().min(0),
  max: Joi.number().required().min(Joi.ref('min'))
});

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  scientificName: Joi.string().allow('').max(120),
  category: Joi.string().min(2).max(80).required(),
  description: Joi.string().min(10).required(),
  imageUrl: Joi.string().uri().required(),
  benefits: Joi.array().items(Joi.string().max(80)).max(10).default([]),
  priceRange: priceRangeSchema.required(),
  dosage: Joi.string().max(200).allow('').default(''),
  isCertified: Joi.boolean().default(false),
  farmerId: Joi.string().required()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  scientificName: Joi.string().max(120).allow(''),
  category: Joi.string().min(2).max(80),
  description: Joi.string().min(10),
  imageUrl: Joi.string().uri(),
  benefits: Joi.array().items(Joi.string().max(80)).max(10),
  priceRange: priceRangeSchema,
  dosage: Joi.string().max(200).allow(''),
  isCertified: Joi.boolean()
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
