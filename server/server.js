// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Import error handling middleware


// Import Route Files
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const billRoutes = require('./routes/billRoutes');
const feePackageRoutes = require('./routes/feePackageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const supplementRoutes = require('./routes/supplementRoutes');
const dietDetailRoutes = require('./routes/dietDetailRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Use CORS middleware - configure it to allow requests from your frontend's origin
const corsOptions = {
  origin: 'http://localhost:5173', // Allow requests only from your frontend's address (Vite's default)
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));


// Body parser middleware to handle JSON data
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded (if needed)


// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount API routes
app.use('/api/auth', authRoutes); // Authentication routes (Public)
app.use('/api/members', memberRoutes); // Member management/viewing routes
app.use('/api/bills', billRoutes); // Bill management/viewing routes
app.use('/api/fee-packages', feePackageRoutes); // Fee package management routes
app.use('/api/notifications', notificationRoutes); // Notification management/viewing routes
app.use('/api/supplements', supplementRoutes); // Supplement store routes
app.use('/api/diet-details', dietDetailRoutes); // Diet details routes
app.use('/api/admin', adminRoutes); // Top-level admin routes (like report export)
app.use('/api/users', userRoutes); // General user routes (like get profile)


// Error handling middleware - MUST be after routes
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});