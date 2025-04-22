// server/scripts/createAdmin.js
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // Import your DB connection
const User = require('../models/User'); // Import your User model

// Load environment variables from server/.env
// Correct path: '.' refers to the current directory (server)
dotenv.config({ path: './.env' }); // <= CORRECTED PATH


// Define admin user details
const adminUsername = 'admin';
const adminPassword = '123456'; // Choose a strong temporary password

const createAdmin = async () => {
  try {
    await connectDB(); // Connect to the database
    console.log('Database connected for script.'); // Added log


    // Check if an admin user already exists
    const adminUserExists = await User.findOne({ username: adminUsername, role: 'Admin' });

    if (adminUserExists) {
      console.log(`Admin user '${adminUsername}' already exists.`);
      process.exit(0); // Exit successfully
      return;
    }

    // Create the new admin user
    // The password will be hashed automatically by the User model's pre-save middleware
    const adminUser = await User.create({
      username: adminUsername,
      password: adminPassword,
      role: 'Admin',
    });

    console.log(`Admin user '${adminUser.username}' created successfully with ID: ${adminUser._id}`);
    console.log(`Password (hashed automatically): ${adminPassword}`); // Display the password you used
    console.log('Please use these credentials to log in.');

    process.exit(0); // Exit successfully

  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Execute the script function
createAdmin();