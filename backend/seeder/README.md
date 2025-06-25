# Admin Seeder Documentation

This document explains how to use the admin seeder scripts to create an admin user automatically.

## Available Scripts

### Create Admin User Only

```
npm run seed:admin
```

This script will create a default admin user with the following credentials:
- Email: admin@example.com
- Password: admin123

The script will check if this admin already exists, and if it does, it will not create it again.

### Run All Seeders

```
npm run seed
```

This script runs all available seeders in the correct order. Currently it includes:
1. Admin seeder

## Customizing Admin Data

To customize the default admin user, you can modify the `adminData` object in `seeder/adminSeeder.js`:

```javascript
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  phone: '1234567890',
  department: 'IT Administration',
  isActive: true,
};
```

## Adding to Application Startup

If you want the admin seeder to run automatically when the application starts (for example, in development or when deploying for the first time), you can add the following code to your `server.js` file:

```javascript
// Import admin seeder
import seedAdmin from './seeder/adminSeeder.js';

// Run admin seeder on startup
if (process.env.NODE_ENV === 'development') {
  seedAdmin()
    .then(() => console.log('Admin user checked/created on startup'))
    .catch(err => console.error('Error seeding admin:', err));
}
```

## Security Note

For production environments, remember to change the default admin password after the first login.
