const router = require("express").Router();
const authController = require("../Controller/authController");
const middlewareController = require("../Controller/middlewareController");

//REGISTER
router.post("/register", authController.registerUser);

//LOGIN
router.post("/login", authController.loginUser);

//RESET PASSWORD REQUEST
router.post("/reset-password", authController.requestPasswordReset);

//RESET PASSWORD WITH TOKEN 
router.post("/reset-password/:token", authController.resetPassword);

//LOGOUT
router.post("/logout", authController.logOut);

//REFRESH TOKEN
router.post("/refresh", authController.requestRefreshToken);

module.exports = router;