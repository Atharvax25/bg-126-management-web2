const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const requestedProducts = req.body.products || (req.body.productId ? [req.body.productId] : []);
    const productIds = [...new Set(requestedProducts.map((id) => String(id)))];

    if (productIds.length === 0) {
      return res.status(400).json({ message: 'At least one product is required.' });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const outOfStock = products.find((product) => product.stock <= 0);
    if (outOfStock) {
      return res.status(400).json({ message: `${outOfStock.name} is out of stock.` });
    }

    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

    await Product.updateMany(
      { _id: { $in: productIds }, stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    const createdOrder = await Order.create({
      userId: req.user._id,
      products: productIds,
      totalAmount,
      status: req.body.status || 'Executed'
    });

    const order = await Order.findById(createdOrder._id).populate('products');
    res.status(201).json({ message: 'Order created.', order });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create order.', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const orders = await Order.find(query)
      .populate('products')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch orders.', error: error.message });
  }
};

module.exports = { createOrder, getOrders };
