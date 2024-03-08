const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { comparePassword, encryptPassword } = require("../libs/utils");
require("dotenv").config();
const KEY = process.env.KEY;

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const err = new Error("User doesn't exist");
      err.statusCode = 401;
      return next(err);
    }
    const isValid = await comparePassword(req.body.password, user.password);

    if (isValid) {
      const tokenObject = jwt.sign({ _id: user._id, role: user.role }, KEY, { expiresIn: "1h" });
      // issueJWT(user);
      res.cookie("token", tokenObject, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(200).send({ ok: true, user: user, token: tokenObject });
    } else {
      const err = new Error("Incorrect password");
      err.statusCode = 401;
      return next(err);
    }
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.statusCode = 500;
    next(err);
  }
};

const signup = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send("User already exists");

    user = new User({
      email: req.body.email,
      password: await encryptPassword(req.body.password),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
    });
    await user.save();
    return res.status(201).send({ ok: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating the user");
  }
}

async function update(req, res) {
  const userId = req.params.id;
  const { email, password, firstName, lastName } = req.body;
  try {
    const updatedFields = {
      email: email || "",
      firstName: firstName || "",
      lastName: lastName || "",
    };

    if (password) {
      const hashedPassword = await encryptPassword(password);
      updatedFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) return res.status(404).send("User not found");

    res.send("Updated!");
  } catch (error) {
    console.error(error);
    if (error.code === 11000) res.status(409).send("Email already exist");
    else res.status(500).send("Update error");
  }
}

async function getUserInfos(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found");

    res.json(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (token) {
      res.clearCookie("token", { expires: new Date(0) });
    }

    res.send({ ok: true });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    next(err);
  }
};

module.exports = { login, signup, update, getUserInfos, getAllUsers, logout };
