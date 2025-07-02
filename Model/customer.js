const mongoose = require('mongoose');

// Define the Address schema
const addressSchema = new mongoose.Schema({
    Street: { type: String },
    City: { type: String },
    State: { type: String },
    PostalCode: { type: String },
    Country: { type: String }
});

// Define the Customer schema
const customerSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    CompanyName: { type: String },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    Phone: { type: String },
    Email: { type: String, unique: true },
    Website: { type: String },
    BillingAddress: addressSchema,
    ShippingAddress: addressSchema
});

// Create the Address model (optional, but useful if you want to use it separately)
const Address = mongoose.model('Address', addressSchema);

// Create the Customer model
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer, Address };