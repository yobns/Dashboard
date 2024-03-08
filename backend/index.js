const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connection = require("./config/database");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes")
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// Routes
app.use("/", userRoutes);
app.use("/file", fileRoutes);

// Initialize MongoDB
async function init() {
  if (connection) {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

init();
module.exports = app;