import FinalProduct from "../models/finalProduct.model.js";
import ProductBatch from "../models/productBatch.model.js";
import ChainEvent from "../models/chainEvent.model.js";
import Industry from "../models/industry.model.js";
import { generateQRCode, generateQRURL } from "../utils/qrCodeService.js";

// ==================== CREATE FINAL PRODUCT ====================

/**
 * Industry creates final product from batch(es)
 * POST /api/v1/products/create
 */
export const createFinalProduct = async (req, res) => {
    try {
        const {
            industryId,
            sourceBatches, // Array of batch IDs
            productName,
            brandName,
            productType,
            category,
            ingredients,
            formulationDetails,
            packaging,
            manufacturingDate,
            expiryDate,
            labTests,
            certifications,
            fssaiLicense,
            drugLicense,
            ayushLicense,
            mrp,
            productImages,
            dosage,
            usageInstructions,
            warnings,
            sideEffects,
            storageInstructions,
            benefits,
            claims,
            barcode,
            sku,
        } = req.body;

        // Validate industry
        const industry = await Industry.findById(industryId);
        if (!industry) {
            return res.status(404).json({
                success: false,
                message: "Industry not found",
            });
        }

        if (!industry.isApproved) {
            return res.status(403).json({
                success: false,
                message: "Industry account is not approved",
            });
        }

        // Validate all source batches exist and are owned by industry
        const batches = await ProductBatch.find({ _id: { $in: sourceBatches } });

        if (batches.length !== sourceBatches.length) {
            return res.status(404).json({
                success: false,
                message: "One or more source batches not found",
            });
        }

        // Check ownership
        const notOwned = batches.filter(
            (batch) =>
                batch.currentOwner.ownerId.toString() !== industryId ||
                batch.currentOwner.ownerType !== "Industry"
        );

        if (notOwned.length > 0) {
            return res.status(403).json({
                success: false,
                message: "Industry does not own all source batches",
            });
        }

        // Create final product
        const finalProduct = new FinalProduct({
            industryId,
            sourceBatches,
            productName,
            brandName,
            productType,
            category,
            ingredients,
            formulationDetails,
            packaging,
            manufacturingDate,
            expiryDate,
            labTests,
            certifications,
            fssaiLicense,
            drugLicense,
            ayushLicense,
            mrp,
            productImages,
            dosage,
            usageInstructions,
            warnings,
            sideEffects,
            storageInstructions,
            benefits,
            claims,
            barcode,
            sku,
            status: "in_production",
        });

        // Generate QR code for final product
        const qrCodeURL = generateQRURL(finalProduct._id, "product");
        const qrCodeData = await generateQRCode(finalProduct._id, "product");

        finalProduct.qrCodeURL = qrCodeURL;
        finalProduct.qrCodeData = qrCodeData;

        await finalProduct.save();

        // Collect all chain events from source batches
        const allChainEvents = [];
        for (const batch of batches) {
            allChainEvents.push(...batch.chainEvents);
        }

        finalProduct.traceabilityChain = allChainEvents;
        await finalProduct.save();

        // Update source batches
        for (const batch of batches) {
            batch.status = "processed";
            batch.finalProduct = finalProduct._id;
            await batch.save();

            // Create processing chain event
            const chainEvent = new ChainEvent({
                batchId: batch._id,
                eventType: "Processing",
                performedBy: {
                    userId: industryId,
                    userType: "Industry",
                    userName: industry.industryName,
                    userPhone: industry.phone,
                },
                metadata: {
                    finalProductId: finalProduct.productId,
                    productName,
                    processingType: "manufacturing",
                    manufacturingDate,
                },
                timestamp: new Date(),
            });

            await chainEvent.save();
            batch.chainEvents.push(chainEvent._id);
            await batch.save();
        }

        res.status(201).json({
            success: true,
            message: "Final product created successfully",
            data: {
                finalProduct,
                qrCodeURL,
                qrCodeData,
            },
        });
    } catch (error) {
        console.error("Create final product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create final product",
        });
    }
};

// ==================== SCAN FINAL PRODUCT QR ====================

/**
 * Scan final product QR and get complete traceability
 * GET /api/v1/products/scan/:productId
 */
export const scanFinalProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { scannedBy } = req.query;

        // Find product and populate all references
        const product = await FinalProduct.findById(productId)
            .populate("industryId", "industryName phone email companyLogo address")
            .populate({
                path: "sourceBatches",
                populate: {
                    path: "farmerId",
                    select: "name phone address profileImage",
                },
            })
            .populate("traceabilityChain");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Update scan count
        product.totalScans += 1;
        product.lastScannedAt = new Date();
        await product.save();

        // Build complete journey
        const journey = {
            farmers: [],
            suppliers: [],
            industry: null,
            finalProduct: null,
        };

        // Get unique farmers
        const farmerIds = new Set();
        for (const batch of product.sourceBatches) {
            if (batch.farmerId && !farmerIds.has(batch.farmerId._id.toString())) {
                farmerIds.add(batch.farmerId._id.toString());
                journey.farmers.push({
                    id: batch.farmerId._id,
                    name: batch.farmerId.name,
                    phone: batch.farmerId.phone,
                    address: batch.farmerId.address,
                    profileImage: batch.farmerId.profileImage,
                    batchDetails: {
                        batchId: batch.batchId,
                        herbName: batch.herbName,
                        harvestDate: batch.harvestDate,
                        quantity: batch.quantity,
                        location: batch.location,
                        gpsCoordinates: batch.gpsCoordinates,
                    },
                });
            }
        }

        // Get suppliers from chain events
        const supplierEvents = product.traceabilityChain.filter(
            (event) => event.eventType === "SupplierPurchase"
        );

        for (const event of supplierEvents) {
            if (event.performedBy.userType === "Supplier") {
                journey.suppliers.push({
                    name: event.performedBy.userName,
                    phone: event.performedBy.userPhone,
                    timestamp: event.timestamp,
                    transaction: event.transaction,
                });
            }
        }

        // Industry details
        journey.industry = {
            id: product.industryId._id,
            name: product.industryId.industryName,
            phone: product.industryId.phone,
            email: product.industryId.email,
            logo: product.industryId.companyLogo,
            address: product.industryId.address,
        };

        // Final product details
        journey.finalProduct = {
            productId: product.productId,
            productName: product.productName,
            brandName: product.brandName,
            productType: product.productType,
            category: product.category,
            manufacturingDate: product.manufacturingDate,
            expiryDate: product.expiryDate,
            mrp: product.mrp,
            certifications: product.certifications,
            labTests: product.labTests,
            ingredients: product.ingredients,
            usageInstructions: product.usageInstructions,
            benefits: product.benefits,
        };

        // Track consumer scan
        if (scannedBy) {
            const scanEvent = new ChainEvent({
                batchId: product.sourceBatches[0]._id,
                eventType: "ConsumerScan",
                performedBy: {
                    userId: scannedBy,
                    userType: "Consumer",
                },
                metadata: {
                    productId: product.productId,
                    productName: product.productName,
                },
                timestamp: new Date(),
            });
            await scanEvent.save();
        }

        res.status(200).json({
            success: true,
            data: {
                product,
                journey,
                totalScans: product.totalScans,
            },
        });
    } catch (error) {
        console.error("Scan final product error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to scan product",
        });
    }
};

// ==================== GET INDUSTRY PRODUCTS ====================

/**
 * Get all products created by an industry
 * GET /api/v1/products/industry/:industryId
 */
export const getIndustryProducts = async (req, res) => {
    try {
        const { industryId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { industryId };
        if (status) {
            query.status = status;
        }

        const products = await FinalProduct.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("sourceBatches", "batchId herbName");

        const total = await FinalProduct.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            },
        });
    } catch (error) {
        console.error("Get industry products error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch products",
        });
    }
};

// ==================== UPDATE PRODUCT STATUS ====================

/**
 * Update product status
 * PATCH /api/v1/products/:productId/status
 */
export const updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const { status, industryId } = req.body;

        const product = await FinalProduct.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Verify ownership
        if (product.industryId.toString() !== industryId) {
            return res.status(403).json({
                success: false,
                message: "Only product owner can update status",
            });
        }

        product.status = status;
        await product.save();

        // Create packaging event if status is packaged
        if (status === "packaged") {
            for (const batchId of product.sourceBatches) {
                const batch = await ProductBatch.findById(batchId);
                batch.status = "packaged";

                const chainEvent = new ChainEvent({
                    batchId: batch._id,
                    eventType: "Packaging",
                    performedBy: {
                        userId: industryId,
                        userType: "Industry",
                    },
                    metadata: {
                        productId: product.productId,
                        productName: product.productName,
                    },
                    timestamp: new Date(),
                });

                await chainEvent.save();
                batch.chainEvents.push(chainEvent._id);
                await batch.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Product status updated",
            data: { product },
        });
    } catch (error) {
        console.error("Update product status error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update product status",
        });
    }
};

// ==================== SEARCH PRODUCTS ====================

/**
 * Search final products
 * GET /api/v1/products/search
 */
export const searchProducts = async (req, res) => {
    try {
        const { productName, category, brandName, page = 1, limit = 10 } = req.query;

        const query = { isActive: true };

        if (productName) {
            query.productName = { $regex: productName, $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        if (brandName) {
            query.brandName = { $regex: brandName, $options: "i" };
        }

        const products = await FinalProduct.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("industryId", "industryName companyLogo");

        const total = await FinalProduct.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            },
        });
    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to search products",
        });
    }
};
