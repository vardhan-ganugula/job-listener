import mongoose from "mongoose";
import {mongodbURI} from './config.util.js'

export async function connectDB() {
    try {
        await mongoose.connect(mongodbURI);
        console.log('DB Connection Successfull');
    } catch (error) {
        console.error(error.message)
    }
}