const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  // Personal Info
  fname:      { type: String, required: true, trim: true },
  lname:      { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, required: true, trim: true },
  dob:        { type: String },
  gender:     { type: String, enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', ''] },
  address:    { type: String, trim: true },
  emName:     { type: String, trim: true },
  emPhone:    { type: String, trim: true },

  // Skills & Availability
  skills:       { type: [String], default: [] },
  availability: { type: [String], default: [] },
  hoursPerWeek: { type: String, default: '1–5 hours' },
  preferredRole:{ type: String, default: 'Frontline worker' },
  experience:   { type: String, default: 'No prior experience' },
  motivation:   { type: String, trim: true },

  // Admin fields
  status:    { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: full name
volunteerSchema.virtual('fullName').get(function () {
  return `${this.fname} ${this.lname}`;
});

volunteerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
