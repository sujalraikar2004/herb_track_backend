import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (filepath) => {
    try {
        if (!filepath) return null;

        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto",
        });

        console.log("File uploaded to Cloudinary:", response.url);
        fs.unlinkSync(filepath); // Clean up the temporary file
        return response;
    } catch (error) {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath); // Ensure cleanup on error
        }
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload file to Cloudinary.");
    }
};
export { uploadonCloudinary };
