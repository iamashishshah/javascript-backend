import Router from "express";
import { loginUser, logoutUsr, refreshAccessToken, registerUser } from "../controllers/user.conrtollers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route('/login').get(loginUser)

// secure routes

router.route('/logout').get(verifyJWT, logoutUsr)
router.route('/refresh-token').post(refreshAccessToken)

export default router;
