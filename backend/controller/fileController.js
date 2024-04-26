require("dotenv").config();
const XLSX = require("xlsx");
const File = require("../models/Files");
const fs = require("fs");

const FILE_EXTENSION = ".xlsx";

const { mergeNames, normalizeHeaders } = require("../libs/utils");

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: error.message });
};

const uploadFile = async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const selectedHeaders = JSON.parse(req.body.selectedHeaders);
    const normalizedHeaders = normalizeHeaders(selectedHeaders);
    let jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      {
        header: normalizedHeaders,
      }
    );
    jsonData = mergeNames(jsonData);

    const existingFiles = await File.find({
      userId: req.body.userId,
      selectedHeaders,
    });

    const isDuplicate = existingFiles.some((file) => {
      const existingData = JSON.stringify(file.jsonData);
      const newData = JSON.stringify(jsonData);
      return existingData === newData;
    });

    if (isDuplicate) {
      return res.status(400).json({
        error: "A file with the same data has already been uploaded.",
      });
    }

    const newFile = new File({
      jsonData,
      fileName: req.body.customName,
      fileType: req.file.mimetype,
      userId: req.body.userId,
      companyName: req.body.companyName,
      selectedHeaders,
    });

    await newFile.save();
    res.json({
      ok: true,
      fileName: req.body.customName,
      companyName: req.body.companyName,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getFile = async (req, res) => {
  try {
    const fileData = await File.findOne({ fileName: req.params.fileName });
    if (!fileData) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(fileData);
  } catch (error) {
    handleError(res, error);
  }
};

const getAllFiles = async (req, res) => {
  try {
    const query = req.role !== "admin" ? { userId: req.body.userId } : {};
    const files = await File.find(query);
    res.json(files);
  } catch (error) {
    handleError(res, error);
  }
};

const exportFile = async (req, res) => {
  try {
    const fileData = await File.findOne({ fileName: req.params.fileName });
    if (!fileData) return res.status(404).send("File not found");

    const jsonData = fileData.jsonData;
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const tempFilePath = `./${req.params.fileName}${FILE_EXTENSION}`;
    XLSX.writeFile(workbook, tempFilePath);

    res.download(tempFilePath, (err) => {
      if (err) throw err;
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteFile = async (req, res) => {
  try {
    const deletedFile = await File.findOneAndDelete({
      fileName: req.params.fileName,
    });
    if (!deletedFile)
      return res.status(404).json({ message: "File not found" });

    res.json({
      message: "File deleted successfully",
      fileName: req.params.fileName,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const searchFiles = async (req, res) => {
  try {
    const files = await File.find({
      fileName: { $regex: req.params.query, $options: "i" },
    });
    res.json(files);
  } catch (error) {
    handleError(res, error);
  }
};

const editHeader = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { headers } = req.body;

    let file = await File.findOne({ fileName });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const oldHeaders = Object.keys(file.jsonData[0]);
    const newHeaders = Object.keys(headers);

    file.jsonData[0] = headers;

    for (let i = 1; i < file.jsonData.length; i++) {
      const row = file.jsonData[i];
      const updatedRow = {};
      for (let j = 0; j < newHeaders.length; j++) {
        const oldHeader = oldHeaders[j];
        const newHeader = newHeaders[j];
        if (row.hasOwnProperty(oldHeader)) {
          updatedRow[newHeader] = row[oldHeader];
          delete row[oldHeader];
        }
      }
      Object.assign(row, updatedRow);
    }
    file.markModified('jsonData');
    await file.save();

    const updatedFile = await File.findOne({ fileName });

    res.json({ message: "Headers updated successfully", file: updatedFile });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  uploadFile,
  getFile,
  getAllFiles,
  exportFile,
  deleteFile,
  searchFiles,
  editHeader,
};