import mongoose from "mongoose";
import express from "express"
import connectDB from "./db/index.js";
const app = express()
import dotenv from "dotenv"
dotenv.config({path:'./env'})

connectDB()