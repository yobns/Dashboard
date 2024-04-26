const express = require("express");
const router = express.Router();
const { validateJWT } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/fileHandler");
const { checkFileName } = require("../middlewares/checkFileName");
const {
  getFile,
  uploadFile,
  getAllFiles,
  exportFile,
  deleteFile,
  searchFiles,
  editHeader,
} = require("../controller/fileController");
const { errorHandler } = require("../middlewares/errorHandler");

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
router.get("/search/:query", validateJWT, searchFiles);
router.put("/edit/headers/:fileName", validateJWT, editHeader);
router.use(errorHandler);
module.exports = router;
