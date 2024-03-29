const express = require("express");

const { register, login, logout, getCurrent, updateSub, updateAvatar} = require("../controllers/usersController");
const { registerUserSchema, loginUserSchema, updateSubSchema } = require("../schemas/userSchemas.js");
const {validateBody} = require("../middlewares/validateBody.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
const { upload } = require("../middlewares/upload.js");


const authRouter = express.Router();

authRouter.post("/register", validateBody(registerUserSchema), register);
authRouter.post("/login", validateBody(loginUserSchema), login);
authRouter.get("/current", authMiddleware, getCurrent);
authRouter.post("/logout", authMiddleware, logout);
authRouter.patch("/subscription", authMiddleware, validateBody(updateSubSchema), updateSub);
authRouter.patch("/avatars", authMiddleware, upload.single("avatar"), updateAvatar);

module.exports = {
  authRouter,
}