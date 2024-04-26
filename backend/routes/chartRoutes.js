const express = require("express");
const {
  getTotalCompanies,
  getTotalFiles,
  getTotalStructures,
  getFileStats,
} = require("../controller/chartController");
const { validateJWT } = require("../middlewares/authMiddleware");
const { errorHandler } = require("../middlewares/errorHandler");

const router = express.Router();

router.get("/totalCompanies", validateJWT, getTotalCompanies);
router.get("/totalFiles", validateJWT, getTotalFiles);
router.get("/totalStructures", validateJWT, getTotalStructures);
router.get("/stats", validateJWT, getFileStats);
router.use(errorHandler);

module.exports = router;
