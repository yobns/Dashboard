require("dotenv").config();
const mongoose = require("mongoose");
const URI = process.env.URI;

const dbConnect = async () => {
  const connection = await mongoose.connect(URI, { dbName: "dashboard" });
  return connection;
};

connection = dbConnect();

module.exports = connection;
