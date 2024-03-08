const File = require("../models/Files");

const checkFileName = async (req, res, next) => {
    const { customName } = req.body;
    const fileExists = await File.findOne({ fileName: customName });

    if (fileExists)
        return res.status(400).json({ message: "File name already exists !" });
    next();
}

module.exports = { checkFileName };