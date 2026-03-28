const mongoose = require('mongoose');
const companyJobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  roleCompanyName: String, // "Role Company Name" override
  location: { type: String, required: true },
  description: String,
  instructions: String,
  
  // New Job Details
  employmentType: { type: String, enum: ['Full-time', 'Internship'], default: 'Internship' },
  locationType: { type: String, enum: ['Remote', 'Office', 'Hybrid'], default: 'Office' },
  stipend: { type: String }, // e.g., "10,000 /month" or "5 LPA"
  
  // Link Requirements
  githubRequired: { type: Boolean, default: false },
  portfolioRequired: { type: Boolean, default: false },

  startDate: Date,
  endDate: Date,
  vacantSlots: { type: Number, default: 1 },
  maxApplicants: Number,
  appliedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CompanyJob', companyJobSchema);
