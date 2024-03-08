const express = require("express");
const router = express.Router();
const {
  validateJWT,
  validateBody,
  validateData,
} = require("../middlewares/authMiddleware");
const {
  login,
  signup,
  update,
  getUserInfos,
  getAllUsers,
  logout,
} = require("../controller/userController");
const { loginSchema, signupSchema } = require("../Schema/Schemas");

router.post("/login", validateBody(loginSchema), validateData, login);
router.post("/signup", validateBody(signupSchema), validateData, signup);
router.get("/logout", logout);
router.put("/user/:id", validateJWT, update);
router.get("/user/:id", validateJWT, getUserInfos);
router.get("/users", validateJWT, getAllUsers);

module.exports = router;
