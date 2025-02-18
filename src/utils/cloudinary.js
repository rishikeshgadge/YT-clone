import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Ensure dotenv is configured
dotenv.config();



// Add validation for required environment variables
const requiredEnvVars = [
    'CLOUDINARY_API_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

// Configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided to uploadOnCloudinary");
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.error(`File not found at path: ${localFilePath}`);
            return null;
        }

        // Log file details before upload
        const fileStats = fs.statSync(localFilePath);
        console.log("Uploading file:", {
            path: localFilePath,
            size: fileStats.size,
            exists: true
        });

        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 60000 // 60 seconds timeout
        });

        console.log("Cloudinary upload successful:", {
            url: response.url,
            public_id: response.public_id
        });

        // Remove the local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        // Only try to delete the file if it exists
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError.message);
            }
        }

        throw error; // Re-throw the error instead of returning null
    }
}

export { uploadOnCloudinary };