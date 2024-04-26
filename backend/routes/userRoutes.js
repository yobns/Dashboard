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
const loginRateLimiter = require("../middlewares/rateLimit");
const { errorHandler } = require("../middlewares/errorHandler");

router.post(
  "/login",
  validateBody(loginSchema),
  validateData,
  loginRateLimiter,
  login
);
router.post("/signup", validateBody(signupSchema), validateData, signup);
router.get("/logout", logout);
router.put("/user/:id", validateJWT, update);
router.get("/user/:id", validateJWT, getUserInfos);
router.get("/users", validateJWT, getAllUsers);
router.use(errorHandler);

module.exports = router;
