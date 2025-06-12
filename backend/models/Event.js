const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  date:       { type: String, required: true },
  location:   { type: String, required: true, trim: true },
  needed:     { type: Number, required: true, min: 1 },
  registered: { type: Number, default: 0 },
  category:   { type: String, required: true },
  description:{ type: String, trim: true },
  status:     { type: String, enum: ['Open', 'Full', 'Closed'], default: 'Open' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-update status when registered changes
eventSchema.pre('save', function (next) {
  if (this.registered >= this.needed) this.status = 'Full';
  else if (this.status === 'Full') this.status = 'Open';
  next();
});

module.exports = mongoose.model('Event', eventSchema);
