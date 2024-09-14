import Router from "express";
import { loginUser, logoutUsr, registerUser } from "../controllers/user.conrtollers.js";
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

router.route('/login').post(loginUser)

// secure routes

router.route('/logout').post(verifyJWT, logoutUsr)
export default router;
