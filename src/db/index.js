import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"

const connectDB = async ()=>{
    try {
       const instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB CONNECTED ${instance.connection.host}`)
    } catch (error) {
        console.log("BHAI error in db index",error);
        process.exit(1)

    
    }

}


export default connectDB