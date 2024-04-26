const multer = require("multer");

module.exports = {
  upload: multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 },
  }),
};
