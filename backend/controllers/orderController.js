const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const createOrder = async (req, res) => {
  try {
    const requestedProducts = req.body.products || [];

    if (!Array.isArray(requestedProducts) || requestedProducts.length === 0) {
      return res.status(400).json({ message: 'Product list cannot be empty.' });
    }

    const productIds = requestedProducts.map((id) => String(id).trim());
    const hasInvalidProductId = productIds.some((id) => !mongoose.Types.ObjectId.isValid(id));

    if (hasInvalidProductId) {
      return res.status(400).json({ message: 'Invalid product ID provided.' });
    }

    const productQuantityMap = productIds.reduce((map, productId) => {
      map[productId] = (map[productId] || 0) + 1;
      return map;
    }, {});
    const uniqueProductIds = Object.keys(productQuantityMap);

    const products = await Promise.all(
      uniqueProductIds.map((productId) => Product.findById(productId))
    );

    const missingProductIndex = products.findIndex((product) => !product);
    if (missingProductIndex !== -1) {
      return res.status(404).json({
        message: 'Product not found.',
        productId: uniqueProductIds[missingProductIndex]
      });
    }

    const outOfStockProduct = products.find(
      (product) => product.stock < productQuantityMap[String(product._id)]
    );
    if (outOfStockProduct) {
      return res.status(400).json({
        message: `${outOfStockProduct.name} does not have enough stock.`
      });
    }

    const totalAmount = products.reduce((sum, product) => {
      return sum + product.price * productQuantityMap[String(product._id)];
    }, 0);

    await Promise.all(
      products.map((product) =>
        Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -productQuantityMap[String(product._id)] } },
          { new: true }
        )
      )
    );

    const createdOrder = await Order.create({
      userId: req.user._id,
      products: productIds,
      totalAmount,
      status: 'pending'
    });

    const order = await Order.findById(createdOrder._id).populate('products');
    res.status(200).json({ message: 'Order created successfully.', order });
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'shipped', 'delivered'];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status must be pending, shipped, or delivered.' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('products');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update order status.', error: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
