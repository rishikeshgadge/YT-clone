import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_API_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return null;
        }
        
        // Log configuration (sanitized for security)
        
        
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        // File has been uploaded successfully
        console.log("File uploaded to cloudinary:", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        // Log the actual error
        console.error("Error uploading to Cloudinary:", error.message);
        
        // Check if file exists before trying to delete
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        }
        return null;
    }
}


export {uploadOnCloudinary}