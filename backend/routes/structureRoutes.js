const express = require("express");
const {
  addStructure,
  verifyFileHeaders,
  getAllStructures,
  updateStructure,
  deleteStructure,
} = require("../controller/structureController");
const { upload } = require("../middlewares/fileHandler");
const { validateJWT } = require("../middlewares/authMiddleware");
const { errorHandler } = require("../middlewares/errorHandler");

const router = express.Router();

router.post("/add", addStructure);
router.post("/verifyHeaders", upload.single("file"), verifyFileHeaders);
router.post("/update", updateStructure);
router.get("/getAll", validateJWT, getAllStructures);
router.delete("/delete", validateJWT, deleteStructure);
router.use(errorHandler);
module.exports = router;
