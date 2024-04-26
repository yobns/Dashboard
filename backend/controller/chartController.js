const File = require("../models/Files");
const Structure = require("../models/Structures");

const buildQuery = (req) => {
  let query = {};
  if (req.query.companyName) query.companyName = req.query.companyName;
  return query;
};

const getTotalCompanies = async (req, res) => {
  try {
    const query = buildQuery(req);
    const count = await Structure.countDocuments(query);
    res.json({ totalCompanies: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalFiles = async (req, res) => {
  try {
    const query = buildQuery(req);
    const count = await File.countDocuments(query);
    res.json({ totalFiles: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalStructures = async (req, res) => {
  try {
    const query = buildQuery(req);
    const count = await Structure.countDocuments(query);
    res.json({ totalStructures: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFileStats = async (req, res) => {
  try {
    const query = buildQuery(req);
    const range = req.query.range || "7";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(range));

    const stats = await File.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            companyName: "$companyName",
          },
          filesAdded: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalFilesAdded: { $sum: "$filesAdded" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 15 },
    ]);

    const fileStats = {};
    stats.forEach((stat) => {
      fileStats[stat._id] = stat.totalFilesAdded;
    });

    const filledData = [];
    for (
      let date = new Date(startDate);
      date <= new Date();
      date.setDate(date.getDate() + 1)
    ) {
      const formattedDate = date.toISOString().split("T")[0];
      const filesAdded = fileStats[formattedDate] || 0;
      filledData.push({ _id: formattedDate, filesAdded });
    }

    res.json(filledData);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  getTotalCompanies,
  getTotalFiles,
  getTotalStructures,
  getFileStats,
};
