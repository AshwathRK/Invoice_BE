const { Item } = require('../Model/items');

// CREATE
const createItem = async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// READ ALL
const getAllItems = async (req, res) => {
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
        const items = await Item.find(filter);

        if (!items || items.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No items found!",
            });
        }

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// READ BY ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE
const updateItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
};
