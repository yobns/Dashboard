const Structure = require('../models/Structures');
const XLSX = require("xlsx");

const addStructure = async (req, res) => {
    const { companyName, headers } = req.body;

    try {
        const newStructure = new Structure({
            companyName: companyName,
            expectedHeaders: headers
        });
        await newStructure.save();
        res.status(201).json({ message: "Structure added successfully", structure: newStructure });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllStructures = async (req, res) => {
    try {
        let query = {};
        if (req.role !== "admin")
            query.userId = req.body.userId;

        const structures = await Structure.find(query);
        res.json(structures);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateStructure = async (req, res) => {
    const { companyName, newHeaders } = req.body;
    try {
        let structure = await Structure.findOne({ companyName: companyName });
        if (structure) {
            structure.expectedHeaders.push(newHeaders);
            await structure.save();
            res.json({ message: "Headers added to existing structure", structure });
        } else {
            res.status(404).json({ error: "Company not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyFileHeaders = async (req, res) => {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0].filter(header => header && header.trim().length > 0);

    try {
        const structures = await Structure.find({});
        let isMatchFound = false;
        let matchedCompanyName = '';

        for (let structure of structures) {
            for (let expectedHeadersSet of structure.expectedHeaders) {
                if (arraysEqual(expectedHeadersSet, headers)) {
                    isMatchFound = true;
                    matchedCompanyName = structure.companyName;
                    break;
                }
            }
            if (isMatchFound) break;
        }

        if (!isMatchFound) {
            const existingCompanyNames = (await Structure.find({})).map(structure => structure.companyName);
            return res.status(202).json({
                message: "No matching structure found.",
                requestCompanyName: true,
                headers: headers,
                existingCompanies: existingCompanyNames
            });
        }
        res.json({ ok: true, message: "Matching structure found.", companyName: matchedCompanyName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

module.exports = { addStructure, verifyFileHeaders, getAllStructures, updateStructure };