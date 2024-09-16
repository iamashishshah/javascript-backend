import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
    console.table(req.body);

    if (!(username || email)) {
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
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // take the token from browser
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    // check if we get or not
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // get the decoded token cuz we get incoded token from the browser
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // find the user using decoded token because everything about user is stored in decoded token
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }

        // match the user's refresh tokne and database's refressh token
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed "
                )
            );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Can't generate refresh token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (oldPassword !== confirmPassword) {
        throw new ApiError(400, "Password does not match with old password");
    }

    const user = await User.findById(req.user?._id);

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Please provide correct old password");
    }

    user.password = newPassword;

    // user.save({validateModifiedOnly: true})
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req?.user;
    if (!user) {
        throw new ApiError(400, "First log in to subscribe");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!(email && fullname)) {
        throw new ApiError(400, "All feilds are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set: {
                fullname, // fullname: fullname
                email,
            },
        },
        { new: true } // new details will be returned to you
    ).select("-password ");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "user details updated successfully"
            )
        );
});

// controller for updating files
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }

    //TODO: delete old image from cloudinary - make a util

    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const updatedAvatar = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAvatar,
                "Avatar is updated successfully"
            )
        );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image is required");
    }

    const coverImage = await uploadOnCloudinary(
        coverImageLocalPath,
        "coverImage"
    );

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading cover image");
    }

    const updatedCoverImage = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedCoverImage,
                "Cover image updated successfully"
            )
        );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    // User.find({username})
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            // how many subscribers has
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            // how many channel has subscribed
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                subscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            },
        },
    ]);
    // console.log(channel)  TODO: we always get array as return

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists");
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUsr,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
};
