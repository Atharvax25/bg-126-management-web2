const User = require('../models/User');
const Order = require('../models/Order');

const getDashboardAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalOrders, revenueData, topSellingProducts] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products',
            totalSold: { $sum: 1 }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: '$product._id',
            name: '$product.name',
            price: '$product.price',
            category: '$product.category',
            totalSold: 1
          }
        }
      ])
    ]);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      topSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch dashboard analytics.', error: error.message });
  }
};

module.exports = { getDashboardAnalytics };
