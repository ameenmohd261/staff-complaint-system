const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'), {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    
    console.log('Database cleared');
    
    // Create departments
    const departments = await Department.insertMany([
      { name: 'IT', description: 'Information Technology Department' },
      { name: 'HR', description: 'Human Resources Department' },
      { name: 'Finance', description: 'Finance and Accounting Department' },
      { name: 'Operations', description: 'Operations Department' },
      { name: 'Marketing', description: 'Marketing and Communications Department' }
    ]);
    
    console.log('Departments created');
    
    // Create admin user
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', adminSalt);
    
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      department: 'IT',
      role: 'admin'
    });
    
    await admin.save();
    
    // Create department heads
    const deptHeadSalt = await bcrypt.genSalt(10);
    const deptHeadPassword = await bcrypt.hash('depthead123', deptHeadSalt);
    
    const itHead = new User({
      name: 'IT Manager',
      email: 'itmanager@example.com',
      password: deptHeadPassword,
      department: 'IT',
      role: 'department_head'
    });
    
    const hrHead = new User({
      name: 'HR Manager',
      email: 'hrmanager@example.com',
      password: deptHeadPassword,
      department: 'HR',
      role: 'department_head'
    });
    
    await itHead.save();
    await hrHead.save();
    
    // Update departments with heads
    await Department.findOneAndUpdate(
      { name: 'IT' },
      { head: itHead._id }
    );
    
    await Department.findOneAndUpdate(
      { name: 'HR' },
      { head: hrHead._id }
    );
    
    // Create regular staff users
    const staffSalt = await bcrypt.genSalt(10);
    const staffPassword = await bcrypt.hash('staff123', staffSalt);
    
    await User.insertMany([
      {
        name: 'IT Staff 1',
        email: 'itstaff1@example.com',
        password: staffPassword,
        department: 'IT',
        role: 'staff'
      },
      {
        name: 'HR Staff 1',
        email: 'hrstaff1@example.com',
        password: staffPassword,
        department: 'HR',
        role: 'staff'
      },
      {
        name: 'Finance Staff 1',
        email: 'financestaff1@example.com',
        password: staffPassword,
        department: 'Finance',
        role: 'staff'
      }
    ]);
    
    console.log('Users created');
    console.log('Database seeded successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();