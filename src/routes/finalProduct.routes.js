import express from "express";
import {
    createFinalProduct,
    scanFinalProduct,
    getIndustryProducts,
    updateProductStatus,
    searchProducts,
} from "../controllers/finalProduct.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/final-products/create
 * @desc    Industry creates final product from batch(es)
 * @access  Private (Industry)
 */
router.post("/create", createFinalProduct);

/**
 * @route   GET /api/v1/final-products/scan/:productId
 * @desc    Scan final product QR and get complete traceability
 * @access  Public
 */
router.get("/scan/:productId", scanFinalProduct);

/**
 * @route   GET /api/v1/final-products/industry/:industryId
 * @desc    Get all products created by an industry
 * @access  Private (Industry)
 */
router.get("/industry/:industryId", getIndustryProducts);

/**
 * @route   PATCH /api/v1/final-products/:productId/status
 * @desc    Update product status
 * @access  Private (Industry)
 */
router.patch("/:productId/status", updateProductStatus);

/**
 * @route   GET /api/v1/final-products/search
 * @desc    Search final products
 * @access  Public
 */
router.get("/search", searchProducts);

export default router;
