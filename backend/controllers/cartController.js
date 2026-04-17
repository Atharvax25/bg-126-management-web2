const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, products: [] });
      cart = await cart.populate('products.productId');
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch cart.', error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Valid product ID is required.' });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({ message: `${product.name} does not have enough stock.` });
    }

    if (product.stock < 5) {
      console.log('Low stock alert:', product.name);
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        products: [{ productId, quantity: parsedQuantity }]
      });
    } else {
      const item = cart.products.find((cartItem) => String(cartItem.productId) === String(productId));

      if (item) {
        const nextQuantity = item.quantity + parsedQuantity;

        if (nextQuantity > product.stock) {
          return res.status(400).json({ message: `${product.name} does not have enough stock.` });
        }

        item.quantity = nextQuantity;
      } else {
        cart.products.push({ productId, quantity: parsedQuantity });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('products.productId');
    res.status(200).json({ message: 'Cart updated.', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update cart.', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const originalLength = cart.products.length;
    cart.products = cart.products.filter((item) => String(item.productId) !== String(productId));

    if (cart.products.length === originalLength) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('products.productId');
    res.status(200).json({ message: 'Product removed from cart.', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove cart item.', error: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart };
