import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Give avatar image, it is required.");
    }

    // upload them to cloudinary, and cloudinary will give us image path or URL
    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "cover image");

    if (!avatar) {
        throw new ApiError(
            500,
            "We've encountered an issue while uploading you avatar, Please try again"
        );
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!isUserCreated) {
        throw new ApiError(
            500,
            "We encountered an issue while creating your account. Please try again later."
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, isUserCreated, "User succefully registered")
        );
});

export { registerUser };
