import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log("🟢 All Cookies:", req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log("🟢 Extracted Token:", token); // Debugging log

        if (!token) {
            throw new ApiError(401, "Unauthorized request - Token missing");
        }

        if (typeof token !== "string") {
            console.error("🔴 Token is not a string:", token);
            throw new ApiError(400, "Invalid token format");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("🟢 Decoded Token:", decodedToken); // Debugging log

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token - User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("🔴 JWT Verification Error:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
