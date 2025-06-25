import colors from 'colors';
import User from '../models/userModel.js';

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  phone: '1234567890',
  department: 'IT Administration',
  isActive: true,
};

// Function to create admin user
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminData.email });
    
    if (adminExists) {
      console.log(colors.yellow.bold('Admin user already exists. Skipping creation.'));
      return;
    }
    
    // Create admin user
    const admin = await User.create(adminData);
    
    console.log(colors.green.bold(`Admin user created: ${admin.email}`));
    return admin;
  } catch (error) {
    console.error(colors.red.bold(`Error creating admin: ${error.message}`));
    throw error;
  }
};

// For direct execution of this file
if (process.argv[1].includes('adminSeeder.js')) {
  // Load environment variables
  import('dotenv').then(dotenv => {
    dotenv.config();
    
    // Connect to database
    import('../config/db.js').then(({ default: connectDB }) => {
      connectDB().then(() => {
        seedAdmin()
          .then(() => {
            console.log(colors.green.bold('Admin seeding completed'));
            process.exit(0);
          })
          .catch(err => {
            console.error(colors.red.bold('Admin seeding failed:', err));
            process.exit(1);
          });
      });
    });
  });
}

export default seedAdmin;
