import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log(`MONGODB CONNECTED ${connectionInstance.connection.host}`); 
    } catch (error) {
        console.log('error occured in db connection', error);
        process.exit(1);
    }
} 