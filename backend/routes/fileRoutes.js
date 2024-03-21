const express = require("express");
const router = express.Router();
const { validateJWT } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/fileHandler");
const { checkFileName } = require("../middlewares/checkFileName");
const { getFile, uploadFile, getAllFiles, exportFile, deleteFile } = require("../controller/fileController");

router.post("/upload", upload.single("file"), validateJWT, checkFileName, uploadFile);
router.get("/getFiles", validateJWT, getAllFiles);
router.get("/:fileName", validateJWT, getFile);
router.get("/export/:fileName", validateJWT, exportFile);
router.delete("/delete/:fileName", validateJWT, deleteFile);
module.exports = router;
