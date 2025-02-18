import mongoose from "mongoose";
import express from "express"
import connectDB from "./db/index.js";
import {app} from './app.js'

import dotenv from "dotenv"
dotenv.config({path:'./.env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`process is running at port${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO DB CONNECTION FAILED");
    
})