import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    department: 'Management',
  },
  {
    name: 'John Doe',
    email: 'employee@example.com',
    password: bcrypt.hashSync('employee123', 10),
    role: 'employee',
    phone: '555-1234',
    department: 'Sales',
  },
  {
    name: 'Jane Smith',
    email: 'employee2@example.com',
    password: bcrypt.hashSync('employee123', 10),
    role: 'employee',
    phone: '555-5678',
    department: 'Support',
  },
];

const categories = [
  {
    name: 'Technical Issue',
    description: 'Problems with software or hardware',
  },
  {
    name: 'Billing Problem',
    description: 'Issues related to billing or payments',
  },
  {
    name: 'Service Quality',
    description: 'Complaints about service quality',
  },
  {
    name: 'Product Defect',
    description: 'Issues with product functionality',
  },
  {
    name: 'Customer Service',
    description: 'Complaints about staff behavior or service',
  },
];

export { users, categories };
