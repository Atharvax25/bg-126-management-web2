const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0
    },
    image: {
      type: String,
      required: [true, 'Product image is required']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
