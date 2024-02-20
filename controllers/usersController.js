const { HttpError } = require("../helpers/HttpError");
const { ctrlWrapper } = require("../helpers/ctrlWrapper.js");
const { sendEmail } = require("../helpers/sendEmail.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
var Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { User } = require("../models/user.js");

const dotenv = require("dotenv");
dotenv.config();

const avatarDir = path.join(__dirname, "../public", "avatars");

const { JWT_SECRET, BASE_URL } = process.env;

const register = async (req, res) => {
  const { email, password, subscription } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationCode = nanoid();

  try {
    const result = await User.create({
      email,
      password: hashedPassword,
      subscription,
      avatarURL,
      verificationCode,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      user: {
        email,
        subscription: result.subscription,
        avatarURL: result.avatarURL
      },
    });
  } catch (error) {
    if (error.message.includes("E11000")) {
      throw HttpError(409, "Email already in use");
    }
    throw error;
  }
};

const verifyEmail = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationCode: "" });

  res.status(200).json({ message: "Email verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = User.findOne({ email });
  if (!user) {
    throw HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Email already verified");
  }

  const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click verify</a>`,
  };
  
  await sendEmail(verifyEmail);

  res.status(200).json({message: "Verification email was sent"})
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign({ payload }, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const updateSub = async (req, res) => {
  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404);
  }
  res.status(200).json(result);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    throw HttpError(400, "No file found to update photo");
  }
  const { path: tempUpload, originalname } = req.file;
  const tit = req.file;
  console.log("reqFile ->", tit);
  console.log("tempUpload ->", tempUpload);

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  console.log('resUpload', resultUpload);

  const image = await Jimp.read(tempUpload);

  await image.resize(250, 250).write(tempUpload);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  const result = await User.findByIdAndUpdate(_id, { avatarURL });

  if (!result) {
    throw HttpError(404);
  }

  res.status(200).json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSub: ctrlWrapper(updateSub),
  updateAvatar: ctrlWrapper(updateAvatar),
};
