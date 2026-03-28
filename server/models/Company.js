const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  location: String,
  
  // New Admin Fields
  industry: { type: String },
  website: { type: String },
  description: { type: String },
  logoUrl: { type: String },
  foundedYear: { type: Number },
  companySize: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);