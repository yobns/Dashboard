const mongoose = require('mongoose');
const { Schema } = mongoose;

const structureSchema = new Schema({
    companyName: { type: String, required: true, unique: true },
    expectedHeaders: [[{ type: String, required: true }]]
});

const Structure = mongoose.model('Structure', structureSchema);

module.exports = Structure;