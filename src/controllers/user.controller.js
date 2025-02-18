import { asyncHandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    //get data from front end
    //validation -nonempty/incorrect
    //CHECK USER EXISTENce - email,username
    //check for images,check for avatars
    //upload them to cloudinary
    //create user object-create entry in db
    //remove password and refresh token feild from response
    //check for user creation
    //return res 
    const {fullname,email,username,password} = req.body
    console.log("email",email)
    if([fullname,email,username,password].some((feild)=>feild?.trim()==="")){
        throw new Apierror(400,"fullname is required")
    }
    const existed = await User.findOne({
        $or:[{username},{email}]
    })
    if(existed){
        throw new Apierror(409,"User with email/username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalFilePath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new Apierror(400,"avatr fle is required")

    }
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalFilePath)
    if(!avatar){
        throw new Apierror(400,"Avatar file required")
    }


    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        username:username.toLowerCase(),

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshtokens"
    )

    if(!createdUser){
        throw new Apierror(500,"something went wrong while regestering the user")
    }


    return res.status(201).json(
        new apiResponse(200,createdUser,"user registered successfully")
    )
 
    



})

export { registerUser }