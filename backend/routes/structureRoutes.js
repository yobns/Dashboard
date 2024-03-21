const express = require('express');
const { addStructure, verifyFileHeaders, getAllStructures, updateStructure } = require('../controller/structureController');
const { upload } = require('../middlewares/fileHandler');
const { validateJWT } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post('/add', addStructure);
router.post("/verifyHeaders", upload.single("file"), verifyFileHeaders);
router.post('/update', updateStructure);
router.get('/getAll', validateJWT, getAllStructures);

module.exports = router;