const express = require("express");
const router = express.Router();
const { validateJWT, validateBody } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/fileHandler");
const { checkFileName } = require("../middlewares/checkFileName");
const {
  getFile,
  uploadFile,
  getAllFiles,
  exportFile,
  deleteFile,
  searchFiles,
} = require("../controller/fileController");
const { searchSchema } = require("../Schema/Schemas");

router.post(
  "/upload",
  upload.single("file"),
  validateJWT,
  checkFileName,
  uploadFile
);
router.get("/getFiles", validateJWT, getAllFiles);
router.get("/:fileName", validateJWT, getFile);
router.get("/export/:fileName", validateJWT, exportFile);
router.delete("/delete/:fileName", validateJWT, deleteFile);
router.get("/search", validateBody(searchSchema), searchFiles);
module.exports = router;
