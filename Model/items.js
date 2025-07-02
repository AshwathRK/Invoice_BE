const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    ProductName: { type: String, required: true },
    SKU: { type: String, unique: true },
    Category: { type: String },
    InitialQty: { type: Number, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    SalesPrice: { type: Number },
    Cost: { type: Number, required: true },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = { Item };