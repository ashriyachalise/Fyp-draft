const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Part = require('../models/Part');
const Notification = require('../models/Notification');

exports.createOrder = async (req, res) => {
  try {
    const { shippingDetails, paymentId, paymentMethod, technician } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.part');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      part: item.part._id,
      name: item.part.name,
      quantity: item.quantity,
      price: item.price
    }));

    // Calculate total
    const totalAmount = cart.totalAmount;

    // Verify all stock first
    for (const item of cart.items) {
      const part = await Part.findById(item.part._id);
      if (!part || part.quantityInStock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock available for ${item.name}` });
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      ...(technician && { technician }),
      items: orderItems,
      shippingDetails,
      totalAmount,
      paymentStatus: 'completed', // Assuming mock payment was successful
      paymentMethod: paymentMethod || 'mock',
      paymentId: paymentId || 'mock_txn_' + Date.now()
    });

    const createdOrder = await order.save();

    // Deduct inventory
    for (const item of cart.items) {
      const part = await Part.findById(item.part._id);
      if (part) {
        part.quantityInStock -= item.quantity;
        await part.save();
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await Notification.create({
      recipient: req.user._id,
      title: 'Order Placed successfully',
      message: `A new order has been placed for Rs. ${createdOrder.totalAmount.toFixed(2)} (ID: ${createdOrder._id}).`,
      type: 'order_placed'
    });

    // Notify ALL Admins about the new revenue
    await Notification.create({
      recipientRole: 'admin',
      title: 'New System Revenue',
      message: `User ${req.user.username} placed a new order of Rs. ${createdOrder.totalAmount.toFixed(2)}.`,
      type: 'revenue_alert'
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    // Admins only: Pull all orders and firmly append the purchasing User's name/email to the response payload
    const orders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
