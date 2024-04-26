const File = require("../models/Files");

const checkFileName = async (req, res, next) => {
  try {
    const { customName } = req.body;
    const fileExists = await File.findOne({ fileName: customName });

    if (fileExists) {
      return res.status(400).json({ message: "File name already exists !" });
    }
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while checking the file name." });
  }
};

module.exports = { checkFileName };
