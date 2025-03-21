import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const fileUploadToCloudinary = async (localFilePath) => {    
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {format: "webp", folder: "furnob"});
        fs.unlinkSync(localFilePath);
        return response;
    }catch (error) {
        fs.unlinkSync(localFilePath);
        console.log('clodinary error', error);        
    }
} 
