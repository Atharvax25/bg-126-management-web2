const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

const logLowStockAlert = (product) => {
  if (product && product.stock < 5) {
    console.log('Low stock alert:', product.name);
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

      if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0 || min > max) {
        return res.status(400).json({ message: 'Invalid price range.' });
      }

      query.price = { $gte: min, $lte: max };
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    products.forEach(logLowStockAlert);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch products.', error: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search keyword is required.' });
    }

    const products = await Product.find(
      { name: { $regex: q.trim(), $options: 'i' } },
      'name price image category stock'
    )
      .sort({ name: 1 })
      .limit(5)
      .lean();

    products.forEach(logLowStockAlert);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to search products.', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, image, category, description, stock } = req.body;

    if (!name || price === undefined || !image || !category || !description || stock === undefined) {
      return res.status(400).json({ message: 'All product fields are required.' });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative.' });
    }

    const product = await Product.create(req.body);
    logLowStockAlert(product);

    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    res.status(400).json({ message: 'Unable to create product.', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const oldPrice = existingProduct.price;

    if (req.body.stock !== undefined && Number(req.body.stock) < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative.' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    logLowStockAlert(product);

    if (req.body.price !== undefined && Number(req.body.price) < oldPrice) {
      console.log(
        `Price drop notification: ${product.name} price dropped from ${oldPrice} to ${product.price}. Notify bookmarked users.`
      );
    }

    res.status(200).json({ message: 'Product updated.', product });
  } catch (error) {
    res.status(400).json({ message: 'Unable to update product.', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(400).json({ message: 'Unable to delete product.', error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const [sameCategoryProducts, popularProducts] = await Promise.all([
      Product.find({
        _id: { $ne: product._id },
        category: product.category,
        stock: { $gt: 0 }
      }).limit(6),
      Order.aggregate([
        { $unwind: '$products' },
        { $match: { products: { $ne: product._id } } },
        { $group: { _id: '$products', orderCount: { $sum: 1 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $replaceRoot: { newRoot: '$product' } }
      ])
    ]);

    const seen = new Set();
    const recommendations = [...sameCategoryProducts, ...popularProducts].filter((item) => {
      const id = String(item._id);

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch recommendations.', error: error.message });
  }
};

module.exports = {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations
};
