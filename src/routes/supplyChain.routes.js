import express from "express";
import {
    createBatch,
    scanBatch,
    getFarmerBatches,
    getBatchById,
    updateBatch,
    searchBatches,
} from "../controllers/supplyChain.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/supply-chain/batches/create
 * @desc    Farmer creates a new product batch
 * @access  Private (Farmer)
 */
router.post("/batches/create", createBatch);

/**
 * @route   GET /api/v1/supply-chain/batches/scan/:batchId
 * @desc    Scan QR code and get complete batch details with chain history
 * @access  Public
 */
router.get("/batches/scan/:batchId", scanBatch);

/**
 * @route   GET /api/v1/supply-chain/batches/farmer/:farmerId
 * @desc    Get all batches created by a farmer
 * @access  Private (Farmer)
 */
router.get("/batches/farmer/:farmerId", getFarmerBatches);

/**
 * @route   GET /api/v1/supply-chain/batches/:batchId
 * @desc    Get single batch details
 * @access  Private
 */
router.get("/batches/:batchId", getBatchById);

/**
 * @route   PATCH /api/v1/supply-chain/batches/:batchId
 * @desc    Update batch details (only by current owner)
 * @access  Private
 */
router.patch("/batches/:batchId", updateBatch);

/**
 * @route   GET /api/v1/supply-chain/batches/search
 * @desc    Search batches by herb name, location, etc.
 * @access  Public
 */
router.get("/batches/search", searchBatches);

export default router;
