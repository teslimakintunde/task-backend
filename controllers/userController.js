const User = require("../models/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const registerShema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerNewUser = async (req, res) => {
  const { name, email, password } = req.body;
  const { error } = registerShema.validate({ name, email, password });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist)
      return res
        .status(409)
        .json({ message: "user already exist, proceed to login" });

    const hashPashword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashPashword });
    if (newUser)
      return res
        .status(200)
        .json({ success: true, message: "New user successfully registered" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate({ email, password });
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const matchPassword = await bcrypt.compare(password, foundUser.password);
    if (!matchPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    if (matchPassword) {
      const accessToken = jwt.sign(
        { name: foundUser.name, userId: foundUser._id.toString() },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const refreshToken = jwt.sign(
        { name: foundUser.name, userId: foundUser._id.toString() }, // Add userId
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      foundUser.refreshToken = refreshToken;
      const result = await foundUser.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });
      // res.json({ accessToken });
      res.json({
        success: true,
        accessToken,
        name: foundUser.name,
        userId: foundUser._id.toString(),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.status(404).json({ message: "Not found" });
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.name !== decoded.name)
      return res.status(403).json({ success: false, message: "Forbidden" });
    const accessToken = jwt.sign(
      { name: foundUser.name, userId: foundUser._id.toString() }, // Add userId
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    // res.json({ accessToken });
    res.json({
      success: true,
      accessToken,
      name: decoded.name,
      userId: foundUser._id.toString(),
    });
  });
};
const handleLogOut = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie(
      "jwt",
      { httpOnly: true },
      { sameSite: "Lax" },
      { secure: false }
    );
    return res.sendStatus(204);
  }
  foundUser.refreshToken = "";
  await foundUser.save();
  res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "Lax" });
  res.sendStatus(204);
};

module.exports = {
  registerNewUser,
  handleLogin,
  handleRefreshToken,
  handleLogOut,
};
