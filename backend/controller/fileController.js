require("dotenv").config();
const XLSX = require("xlsx");
const File = require("../models/Files");
const fs = require("fs");

const uploadFile = async (req, res) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const jsonData = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );
  try {
    const newFile = new File({
      jsonData: jsonData,
      fileName: req.body.customName,
      fileType: req.file.mimetype,
      userId: req.body.userId,
    });

    await newFile.save();
    res.json({ ok: true, fileName: req.body.customName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const fileData = await File.findOne({ fileName: fileName });
    res.json(fileData.jsonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllFiles = async (req, res) => {
  try {
    let query = {};
    if (req.role !== "admin")
      query.userId = req.body.userId;
    
    const files = await File.find(query);
    res.json(files);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const exportFile = async (req, res) => {
  const fileName = req.params.fileName;
  const fileData = await File.findOne({ fileName: fileName });
  if (!fileData) return res.status(404).send("File not found");

  const jsonData = fileData.jsonData;
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const tempFilePath = `./${fileName}.xlsx`;
  XLSX.writeFile(workbook, tempFilePath);

  res.download(tempFilePath, (err) => {
    if (err) throw err;
    fs.unlinkSync(tempFilePath);
  });
};

const deleteFile = async (req, res) => {
  const { fileName } = req.params;
  try {
    const deletedFile = await File.findOneAndDelete({ fileName: fileName });
    if (!deletedFile)
      return res.status(404).json({ message: "File not found" });

    res.json({ message: "File deleted successfully", fileName: fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchFiles = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing search query" });
    }

    const searchResults = await File.find({
      name: { $regex: new RegExp(query, "i") },
    });

    res.json({ ok: true, results: searchResults });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

module.exports = {
  uploadFile,
  getFile,
  getAllFiles,
  exportFile,
  deleteFile,
  searchFiles,
};