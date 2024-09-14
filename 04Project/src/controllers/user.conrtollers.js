import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // we're not validating, we're just saving

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, `Internal server error, please try again`);
    }
};

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
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Give avatar image, it is required.");
    }

    // upload them to cloudinary, and cloudinary will give us image path or URL
    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");
    const coverImage = await uploadOnCloudinary(
        coverImageLocalPath,
        "cover image"
    );

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

// USER LOGIN CONTRONLLER
const loginUser = asyncHandler(async (req, res) => {
    /*
     * LOGIN TODO'S
     * take: username or emamil and password
     * verify: username && password if exist or not
     * if username or email correct and password wrong then say password wrong
     * if password is correc then say email or username wrong
     * if both wrong then don't have account? create one
     * if everything fine then ask authenticator to give access token for certain period of time
     * how to get refresh token each time and validate
     */

    /*
     * req body -> data
     * username or email
     * find user
     * password check
     * access and refresh token
     * send cookie
     */

    const { username, email, password } = req.body;

    if (!username || !email) {
        throw new ApiError(400, `username or email is required`);
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, `Incorrect password, please try again`);
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    // want updated user: two options, call database query or else save the refreshToken to user here only
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUsr = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {},
            "User logged out successfully"
        )
    )
});

export { registerUser, loginUser, logoutUsr };
