import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/ApiResponse.js";
import jwt from  "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken  = refreshtoken

        await user.save({validateBeforeSave:false})
        
        return {accesstoken,refreshtoken}
        
        
    } catch (error) {
        throw new ApiError(500,"error while generating refresha nd access token")
        
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //console.log("🔹 Received Request Body:", req.body);
    //console.log("🔹 Received Uploaded Files:", req.files);

    // Extracting fields from request body
    const { fullname, email, username, password } = req.body;

    // Validation: Ensure required fields are not empty
    if ([fullname, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields (fullname, email, username, password) are required");
    }

    // Check if user already exists
    const existed = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existed) {
        throw new ApiError(409, "User with email/username already exists");
    }

    // Debugging: Log uploaded files
    

    // Extract file paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalFilePath = req.files?.coverImage?.[0]?.path;

    // Validate that avatar is provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    //console.log("🔹 Uploading avatar to Cloudinary...");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar || !avatar.url) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    // Upload cover image to Cloudinary (optional)
    let coverImage = null;
    if (coverLocalFilePath) {
        //console.log("🔹 Uploading cover image to Cloudinary...");
        coverImage = await uploadOnCloudinary(coverLocalFilePath);
    }

    // Create new user in database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshtokens");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    console.log("✅ User registered successfully:", createdUser);

    // Return success response
    return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accesstoken, refreshtoken } = await generateAccessandRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken");

    return res
        .status(200)
        .cookie("accessToken", accesstoken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })
        .cookie("refreshToken", refreshtoken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })
        .json(new apiResponse(200, { user: loggedInUser, accesstoken, refreshtoken }, "User logged in successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshtoken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "strict" })
        .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" })
        .json(new apiResponse(200, {}, "User logged out"));
});

export { registerUser,logInUser,logOutUser };
