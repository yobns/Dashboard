const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
};

module.exports = { errorHandler };
