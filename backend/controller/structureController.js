const Structure = require("../models/Structures");
const XLSX = require("xlsx");
const { mergeAndNormalizeHeaders } = require("../libs/utils");
const handleError = (res, error) =>
  res.status(500).json({ error: error.message });

const addStructure = async (req, res) => {
  const { companyName, headers } = req.body;
  const normalizedHeaders = mergeAndNormalizeHeaders(headers);

  try {
    const newStructure = new Structure({
      companyName,
      expectedHeaders: [normalizedHeaders],
    });
    await newStructure.save();
    res.status(201).json({
      message: "Structure added successfully",
      structure: newStructure,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteStructure = async (req, res) => {
  try {
    const deletedStructure = await Structure.findOneAndDelete({
      companyName: req.body.companyName,
    });
    if (!deletedStructure) {
      return res.status(404).json({ message: "Structure not found" });
    }
    res.json({
      message: "Structure deleted successfully ",
      companyName: req.body.companyName,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

const getAllStructures = async (req, res) => {
  try {
    const query = req.role !== "admin" ? { userId: req.body.userId } : {};
    const structures = await Structure.find(query);
    res.json(structures);
  } catch (error) {
    handleError(res, error);
  }
};
const updateStructure = async (req, res) => {
  const { companyName, newHeaders } = req.body;
  const normalizedNewHeaders = mergeAndNormalizeHeaders(newHeaders);

  try {
    const structure = await Structure.findOne({ companyName });
    if (!structure) return res.status(404).json({ error: "Company not found" });

    structure.expectedHeaders.push(normalizedNewHeaders);
    await structure.save();
    res.json({ message: "Headers added to existing structure", structure });
  } catch (error) {
    handleError(res, error);
  }
};

const verifyFileHeaders = async (req, res) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const headers = getHeadersFromWorkbook(workbook);

  try {
    const structures = await Structure.find({});
    const matchedStructure = findMatchingStructure(structures, headers);

    if (!matchedStructure) {
      const existingCompanyNames = structures.map(
        (structure) => structure.companyName
      );
      return res.status(202).json({
        message: "No matching structure found.",
        requestCompanyName: true,
        headers,
        existingCompanies: existingCompanyNames,
      });
    }
    res.json({
      ok: true,
      message: "Matching structure found.",
      companyName: matchedStructure.companyName,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getHeadersFromWorkbook = (workbook) => {
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils
    .sheet_to_json(worksheet, { header: 1 })[0]
    .filter((header) => header && header.trim().length > 0);
};

const findMatchingStructure = (structures, headers) => {
  for (const structure of structures) {
    for (const expectedHeadersSet of structure.expectedHeaders) {
      if (arraysEqual(expectedHeadersSet, headers)) {
        return structure;
      }
    }
  }
  return null;
};

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

module.exports = {
  addStructure,
  verifyFileHeaders,
  getAllStructures,
  updateStructure,
  deleteStructure,
};
