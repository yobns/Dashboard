const jwt = require("jsonwebtoken");
const Ajv = require("ajv");
require("dotenv").config();
const KEY = process.env.KEY;
const ajv = new Ajv();

const validateData = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!emailRegex.test(email))
    return res.status(400).send("Invalid email format");

  next();
};

const validateJWT = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).send("Access Denied, No Token Provided");
  }
  jwt.verify(token, KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    } else if (decoded) {
      req.body.userId = decoded._id;
      req.role = decoded.role;
      next();
    } else {
      res.status(500).send("Error verifying token");
    }
  });
};

const validateBody = (schema) => {
  return function (req, res, next) {
    const valid = ajv.validate(schema, req.body);
    if (!valid) {
      res.status(400).send(ajv.errors[0]);
    } else {
      next();
    }
  };
};

module.exports = { validateData, validateJWT, validateBody };
