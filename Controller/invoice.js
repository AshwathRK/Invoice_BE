const Invoice = require('../Model/invoice')

const handleGetInvoiceById = async (req, res) => {
    try {
        const { id: invoiceId } = req.params;

        if (!invoiceId) {
            return res.status(400).json({
                status: false,
                message: "Invoice ID is required"
            });
        }

        const invoice = await Invoice.findOne({ _id: invoiceId });

        if (!invoice) {
            return res.status(404).json({
                status: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Invoice fetched successfully",
            data: invoice
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return res.status(500).json({
            status: false,
            message: `Internal Server Error: ${error.message}`
        });
    }
};

const handleAllTheInvoiceData = async (req, res) => {
    try {
        // Extract pagination params with defaults
        const page = parseInt(req.query.page) || 1;         // Default page = 1
        const limit = parseInt(req.query.limit) || 10;      // Default limit = 10
        const skip = (page - 1) * limit;
        const userId = req.query.userId;                    // Extract userId from query params
        const search = req.query.search;                    // Extract search term from query params

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User ID is required"
            });
        }

        // Create a filter object
        const filter = { userId };

        // If search term is provided, add it to the filter
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } }, // Search in invoiceNumber
                // Add more fields to search in if needed
            ];
        }

        // Fetch paginated data
        const invoices = await Invoice.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Count total documents for frontend pagination
        const totalDocuments = await Invoice.countDocuments(filter);

        if (invoices.length === 0) {
            return res.status(404).json({
                status: false,
                message: search ? "No invoices found matching the search term!" : "No invoices found for the user!"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Data fetched successfully",
            data: invoices,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDocuments / limit),
                totalDocuments
            }
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({
            status: false,
            message: `Internal Server Error: ${error.message}`
        });
    }
};

// Create the invoice
const handleCreateInvoice = async (req, res) => {
    try {
        const {
            clientName,
            userId,
            clientEmail,
            clientAddress,
            clientPhone,
            invoiceDate,
            invoiceNumber,
            items,
            tax = 0,
            dueDate,
            notes,
            customerId,
            pdfUrl
        } = req.body;

        // // Validate required fields
        // if (!clientName || !clientAddress || !invoiceNumber || !invoiceDate || !items || !Array.isArray(items) || items.length === 0) {
        //   return res.status(400).json({ message: 'Missing required fields. Please provide clientName, clientAddress, invoiceNumber, invoiceDate, and at least one item.' });
        // }

        // Required field check
        const requiredFields = { clientName, userId, invoiceNumber, invoiceDate, items, customerId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required.`,
                });
            }
        }

        for (const item of items) {
            if (!item.description || item.quantity == null || item.unitPrice == null) {
                return res.status(400).json({ message: 'Each item must include description, quantity, and unitPrice.' });
            }
        }

        // Calculate subTotal and total
        const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const total = subTotal + ((subTotal * tax) / 100);

        const populatedItems = items.map(item => ({
            ...item,
            amount: item.quantity * item.unitPrice
        }));

        const invoice = new Invoice({
            clientName,
            customerId,
            clientEmail,
            clientAddress,
            clientPhone,
            invoiceNumber,
            invoiceDate,
            dueDate,
            items: populatedItems,
            subTotal,
            tax,
            total,
            notes,
            userId,
            pdfUrl
        });

        await invoice.save();
        return res.status(201).json({ message: 'Invoice created successfully', invoice });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update the invoice
const handleUpdateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            clientName,
            invoiceNumber,
            customerId,
            invoiceDate,
            items,
            tax = 0,
            clientAddress,
            clientEmail,
            clientPhone,
            dueDate,
            notes,
            status
        } = req.body;

        // Required field check
        const requiredFields = { clientName, invoiceNumber, customerId, invoiceDate, items };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required.`,
                });
            }
        }

        for (const item of items) {
            if (!item.description || item.quantity == null || item.unitPrice == null) {
                return res.status(400).json({ message: 'Each item must include description, quantity, and unitPrice.' });
            }
        }

        const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const total = subTotal + ((subTotal * tax) / 100);

        const updatedItems = items.map(item => ({
            ...item,
            amount: item.quantity * item.unitPrice
        }));

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            {
                clientName,
                customerId,
                clientAddress,
                clientEmail,
                clientPhone,
                invoiceNumber,
                invoiceDate,
                dueDate,
                items: updatedItems,
                subTotal,
                tax,
                total,
                notes,
                status
            },
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        return res.status(200).json({ message: 'Invoice updated successfully', invoice: updatedInvoice });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const handleDeleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the invoice exists
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Delete the invoice
        await Invoice.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        console.error('Error deleting invoice:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    handleAllTheInvoiceData, handleGetInvoiceById, handleCreateInvoice, handleUpdateInvoice, handleDeleteInvoice
};
