const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema({
  jsonData: {
    type: Object,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;