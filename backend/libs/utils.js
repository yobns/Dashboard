const bcrypt = require("bcryptjs");
require("dotenv").config();
const stringSimilarity = require("string-similarity");

const encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.NUMSALTROUNDS));
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw error;
  }
};

const comparePassword = async (password, hash) => {
  try {
    const res = await bcrypt.compare(password, hash);
    return res;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

const standardHeaders = [
  "user name",
  "first name",
  "last name",
  "company name",
  "user_name",
];

const normalizeHeader = (header) => {
  const similarities = stringSimilarity.findBestMatch(header, standardHeaders);
  const bestMatch = similarities.bestMatch;
  if (bestMatch.rating >= 0.8) {
    return bestMatch.target;
  }

  return header.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
};

const mergeNames = (data) => {
  return data.map((row) => {
    const firstNameKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes("first") &&
        key.toLowerCase().includes("name")
    );
    const lastNameKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes("last") && key.toLowerCase().includes("name")
    );

    let fullName;

    if (firstNameKey && lastNameKey) {
      fullName = `${row[firstNameKey]} ${row[lastNameKey]}`;
      delete row[firstNameKey];
      delete row[lastNameKey];
    }
    const newRow = { "Full Name": fullName, ...row };
    return newRow;
  });
};

const normalizeHeaders = (selectedHeaders) => {
  const normalizedHeaders = selectedHeaders.map((header) =>
    normalizeHeader(header)
  );
  return normalizedHeaders;
};

const mergeAndNormalizeHeaders = (headers) => {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  return normalizedHeaders;
};

module.exports = {
  encryptPassword,
  comparePassword,
  mergeNames,
  normalizeHeaders,
  mergeAndNormalizeHeaders,
};
