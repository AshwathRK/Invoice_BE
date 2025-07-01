const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true }, // usually calculated as quantity * unitPrice
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientAddress: { type: String, required: true },
  clientEmail: { type: String },
  clientPhone: { type: String },

  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date },

  items: { type: [itemSchema], required: true },

  subTotal: { type: Number, required: true },
  tax: { type: Number, default: 0 }, // optional
  total: { type: Number, required: true },

  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },

  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  pdfUrl: { type: String }, // optional - path to generated/stored PDF

}, {
  timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Invoice', invoiceSchema);
