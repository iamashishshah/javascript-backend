import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend: DONE
    // validation - empty check, formate check: DONE
    // check if user already exists: username, email: DONE
    // check for image, check for avatar:
    // upload them to clodinary, avatar
    // create a user object - create entry in db
    // remove password and refresh token field from response given by mongoDB, cuz it gives return everything
    // check for user creation - created or not
    // return res
    // so what req.body gives us?  everything that user enters with some additional header properties
    const { fullname, email, username, password } = req.body;
    console.log(fullname, email);

    // if(!fullname) throw new ApiError(400, "Please sir provide your name, we'll not use on pornhub")

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // but I suppose if a user enters 3 fields and username, and i want to give msg to user that he/she should enter "username is required how can i do this?"

    // how to check formatting of email that if email contains @ or not, and we'll accept only @gmail.com, @outlook.com, @apple.com

    const existedUser = User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files)

    // check we got cover image or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "Give avatar image, it is required.");
    }

    // upload them to cloudinary, and cloudinary will give us image path or URL
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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
        "-pasword -refreshToken"
    );
    if (!isUserCreated) {
        throw new ApiError(
            500,
            "We encountered an issue while creating your account. Please try again later."
        );
    }

    return res.status(201).json(
        new ApiResponse(200, isUserCreated, "User succefully registered")
    )
});

export { registerUser };
