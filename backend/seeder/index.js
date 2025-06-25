import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from '../config/db.js';

// Import seeders
import seedAdmin from './adminSeeder.js';
import seedCategories from './categorySeeder.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Function to run all seeders
const runSeeders = async () => {
  try {
    console.log(colors.cyan.bold('=== Running Data Seeders ==='));
      // Run admin seeder
    await seedAdmin();
    
    // Run category seeder
    await seedCategories();
    
    // Add more seeders here as needed
    // await seedOtherData();
    
    console.log(colors.cyan.bold('=== Data Seeding Complete ==='));
    process.exit();
  } catch (error) {
    console.error(colors.red.bold(`Error during seeding: ${error.message}`));
    process.exit(1);
  }
};

// Run seeders
runSeeders();
