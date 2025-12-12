import QRCode from "qrcode";

/**
 * Generate QR code for a batch
 * @param {string} batchId - Batch ID
 * @param {string} type - Type of QR (batch or product)
 * @returns {Promise<string>} - Base64 QR code data
 */
export const generateQRCode = async (batchId, type = "batch") => {
    try {
        const baseURL = process.env.FRONTEND_URL || "https://yourapp.com";
        const qrData = `${baseURL}/scan/${type}/${batchId}`;

        // Generate QR code as base64 data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: "H",
            type: "image/png",
            quality: 0.95,
            margin: 1,
            width: 300,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
};

/**
 * Generate QR code URL for scanning
 * @param {string} id - Batch or Product ID
 * @param {string} type - Type (batch or product)
 * @returns {string} - Scannable URL
 */
export const generateQRURL = (id, type = "batch") => {
    const baseURL = process.env.FRONTEND_URL || "https://yourapp.com";
    return `${baseURL}/scan/${type}/${id}`;
};

/**
 * Generate QR code as buffer (for file upload)
 * @param {string} batchId - Batch ID
 * @param {string} type - Type of QR
 * @returns {Promise<Buffer>} - QR code buffer
 */
export const generateQRCodeBuffer = async (batchId, type = "batch") => {
    try {
        const baseURL = process.env.FRONTEND_URL || "https://yourapp.com";
        const qrData = `${baseURL}/scan/${type}/${batchId}`;

        const buffer = await QRCode.toBuffer(qrData, {
            errorCorrectionLevel: "H",
            type: "png",
            width: 300,
        });

        return buffer;
    } catch (error) {
        console.error("Error generating QR code buffer:", error);
        throw new Error("Failed to generate QR code buffer");
    }
};
