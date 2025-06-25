import colors from 'colors';
import Category from '../models/categoryModel.js';

// Default categories data
const categoriesData = [
  {
    name: 'Technical Issues',
    description: 'Hardware, software, and IT-related problems'
  },
  {
    name: 'HR & Personnel',
    description: 'Human resources, workplace, and personnel issues'
  },
  {
    name: 'Facilities',
    description: 'Building, maintenance, and facility-related concerns'
  },
  {
    name: 'Financial',
    description: 'Billing, payments, and financial discrepancies'
  },
  {
    name: 'Customer Service',
    description: 'Service quality and customer interaction issues'
  }
];

// Function to create default categories
const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find({});
    
    if (existingCategories.length > 0) {
      console.log(colors.yellow.bold(`${existingCategories.length} categories already exist. Skipping creation.`));
      return existingCategories;
    }
    
    // Create categories
    const createdCategories = await Category.insertMany(categoriesData);
    
    console.log(colors.green.bold(`${createdCategories.length} categories created successfully!`));
    createdCategories.forEach(cat => {
      console.log(colors.cyan(`- ${cat.name}: ${cat.description}`));
    });
    
    return createdCategories;
  } catch (error) {
    console.error(colors.red.bold(`Error creating categories: ${error.message}`));
    throw error;
  }
};

// For direct execution of this file
if (process.argv[1].includes('categorySeeder.js')) {
  // Load environment variables
  import('dotenv').then(dotenv => {
    dotenv.config();
    
    // Connect to database
    import('../config/db.js').then(({ default: connectDB }) => {
      connectDB().then(() => {
        seedCategories()
          .then(() => {
            console.log(colors.green.bold('Category seeding completed'));
            process.exit(0);
          })
          .catch(err => {
            console.error(colors.red.bold('Category seeding failed:', err));
            process.exit(1);
          });
      });
    });
  });
}

export default seedCategories;
