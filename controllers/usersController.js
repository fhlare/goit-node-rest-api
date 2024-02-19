const {HttpError} = require("../helpers/HttpError");
const { ctrlWrapper } = require("../helpers/ctrlWrapper.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {User} = require('../models/user.js');


const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { email, password, subscription } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await User.create({
      email,
      password: hashedPassword,
      subscription,
    });
    res.status(201).json({
      user: {
        email,
        subscription: result.subscription,
      },
    });
  } catch (error) {
    if (error.message.includes("E11000")) {
      throw HttpError(409, "Email already in use");
    }
    throw error;
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); 
  if (!user) {
    throw HttpError(401, "Email or password invalid"); 
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


module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSub: ctrlWrapper(updateSub),
};