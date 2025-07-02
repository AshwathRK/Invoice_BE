const { Customer } = require('../Model/customer'); // update path as necessary

// Get all customers for a user
const getAllCustomers = async (req, res) => {
    try {
        const userId = req.params;
        const search = req.query.search;

        let filter = userId;

        if (search) {
            const regex = new RegExp(search, 'i'); // 'i' makes the search case-insensitive
            filter = {
                ...filter,
                $or: [
                    { name: regex },
                    { email: regex },
                    { phone: regex },
                    // Add more fields as needed
                ],
            };
        }

        const customers = await Customer.find(filter);

        if (!customers || customers.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No customers found!",
            });
        }

        res.status(200).json({ success: true, data: customers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCustomerByNewId = async (req, res) => {
    try {
        const newCustomerId = req.params.newCustomerId;

        const customer = await Customer.findOne({ _id: newCustomerId });

        if (!customer) {
            return res.status(404).json({
                status: false,
                message: "Customer not found!",
            });
        }

        res.status(200).json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create (POST) a new customer
const createCustomer = async (req, res) => {
    // debugger
    try {
        const {
            FirstName,
            Email ,
            userId
        } = req.body;

        const requiredFields = { FirstName, Email, userId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required.`,
                });
            }
        }

        const isExistEmail = await Customer.findOne({Email})
        if(isExistEmail){
            return res.status(409).json({
                status: false,
                message: "The Email address already exist"
            })
        }
        const newCustomer = new Customer(req.body);
        const savedCustomer = await newCustomer.save();
        res.status(201).json({ success: true, data: savedCustomer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update (PUT) customer by ID
const updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: updatedCustomer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete customer by ID
const deleteCustomer = async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllCustomers,
    createCustomer,
    getCustomerByNewId,
    updateCustomer,
    deleteCustomer
};
