const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookmark', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);

app.use(express.static(path.join(__dirname, '..')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ForgeCart API' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

const defaultProducts = [
  {
    name: 'Hackathon Hoodie 2026',
    price: 59.99,
    image: 'assets/images/hoodie.png',
    category: 'clothing',
    description: 'Premium hoodie built for long build sessions and cold demo halls.',
    stock: 25
  },
  {
    name: 'Code Powered T-Shirt',
    price: 29.99,
    image: 'assets/images/tshirt.png',
    category: 'clothing',
    description: 'Soft developer tee for shipping fast and staying comfortable.',
    stock: 40
  },
  {
    name: 'Premium Dev Backpack',
    price: 89.99,
    image: 'assets/images/backpack.png',
    category: 'accessories',
    description: 'Structured backpack with room for laptops, cables, and launch-day snacks.',
    stock: 15
  },
  {
    name: 'API Access Token (1Yr)',
    price: 149.99,
    image: 'assets/images/api_token.png',
    category: 'digital',
    description: 'One year developer access token for the ForgeCart digital asset suite.',
    stock: 100
  },
  {
    name: 'Developer Sticker Pack',
    price: 14.99,
    image: 'assets/images/stickers.png',
    category: 'accessories',
    description: 'A collection of ForgeCart decals for laptops, notebooks, and gear cases.',
    stock: 60
  },
  {
    name: 'Debug Fuel Mug',
    price: 19.99,
    image: 'assets/images/mug.png',
    category: 'accessories',
    description: 'Ceramic mug for coffee, tea, and late-night fix attempts.',
    stock: 30
  }
];

const seedProducts = async () => {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany(defaultProducts);
    console.log('Default ForgeCart products seeded.');
  }
};

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`ForgeCart API running at http://localhost:${PORT}`);
  });

  try {
    await connectDB();
    await seedProducts();
  } catch (error) {
    console.error('Server is running, but MongoDB is not connected. Check Atlas Network Access, credentials, and restart the server.');
  }
};

startServer();
