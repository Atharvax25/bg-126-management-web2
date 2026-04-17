const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const toggleBookmark = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.some((id) => String(id) === String(productId));

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((id) => String(id) !== String(productId));
      await user.save();

      return res.status(200).json({
        message: 'Bookmark removed.',
        bookmarked: false,
        bookmarks: user.bookmarks
      });
    }

    user.bookmarks.push(productId);
    await user.save();

    res.status(200).json({
      message: 'Bookmark added.',
      bookmarked: true,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update bookmark.', error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');

    res.status(200).json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch bookmarks.', error: error.message });
  }
};

module.exports = { toggleBookmark, getBookmarks };
