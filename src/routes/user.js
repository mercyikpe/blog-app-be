const userRouter = require("express").Router();

const upload = require("../middlewares/uploadFile");

const {
    registerUser,
    verifyEmail,
    loginUser,
    userProfile,
    logoutUser, 
    forgetPassword,
    resetPassword,
} = require("../controllers/user");

const {protect} = require("../middlewares/auth");

userRouter.post("/", upload.single("profilePicture"), registerUser);
userRouter.post("/activate", verifyEmail);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/profile", protect,  userProfile);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;
