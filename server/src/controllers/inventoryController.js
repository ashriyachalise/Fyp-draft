const Part = require('../models/Part');
const Notification = require('../models/Notification');

// @desc    Get all parts
// @route   GET /api/inventory
// @access  Private
exports.getParts = async (req, res) => {
  try {
    const parts = await Part.find({});
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new part
// @route   POST /api/inventory
// @access  Private/Admin/Manager
exports.addPart = async (req, res) => {
  const { name, partNumber, description, category, price, quantityInStock, minimumStockLevel, supplier, location } = req.body;

  try {
    const part = new Part({
      name,
      partNumber,
      description,
      category,
      price,
      quantityInStock,
      minimumStockLevel,
      supplier,
      location
    });

    const createdPart = await part.save();

    await Notification.create({
      recipient: req.user?._id,
      title: 'New Part Added to Inventory',
      message: `A new part has been added: ${createdPart.name} (${createdPart.partNumber})`,
      type: 'inventory_added'
    });

    res.status(201).json(createdPart);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.partNumber) {
      return res.status(400).json({ message: 'A part with this Part Number already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update part quantity
// @route   PATCH /api/inventory/:id/quantity
// @access  Private/Manager/Technician
exports.updatePartQuantity = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (part) {
      part.quantityInStock = req.body.quantityInStock;
      const updatedPart = await part.save();
      res.json(updatedPart);
    } else {
      res.status(404).json({ message: 'Part not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a part
// @route   DELETE /api/inventory/:id
// @access  Private/Admin/Manager/Client
exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (part) {
      await part.deleteOne();
      res.json({ message: 'Part removed' });
    } else {
      res.status(404).json({ message: 'Part not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
