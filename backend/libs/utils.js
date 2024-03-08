const bcrypt = require("bcryptjs");

require("dotenv").config();

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(Number(process.env.NUMSALTROUNDS));
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const comparePassword = async (password, hash) => {
  const res = await bcrypt.compare(password, hash);
  return res;
};

module.exports = { encryptPassword, comparePassword };
