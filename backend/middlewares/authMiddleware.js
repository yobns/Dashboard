const jwt = require("jsonwebtoken");
const Ajv = require("ajv");
require("dotenv").config();
const KEY = process.env.KEY;
const ajv = new Ajv();

const validateEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

const validateJWT = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).send("Access Denied, No Token Provided");
  }

  try {
    const decoded = await jwt.verify(token, KEY);
    req.body.userId = decoded._id;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

const validateBody = (schema) => {
  return async (req, res, next) => {
    const valid = ajv.validate(schema, req.body);
    if (!valid) {
      res.status(400).send(ajv.errorsText(ajv.errors));
    } else {
      next();
    }
  };
};

const validateData = (req, res, next) => {
  const { email } = req.body;

  if (!validateEmailFormat(email)) {
    return res.status(400).send("Invalid email format");
  }

  next();
};

module.exports = { validateData, validateJWT, validateBody };
