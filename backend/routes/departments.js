const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
const Department = require('../models/Department');

// @route   GET api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email');
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/departments
// @desc    Create a department
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    adminAuth,
    [check('name', 'Department name is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, head } = req.body;

      // Check if department already exists
      let department = await Department.findOne({ name });
      if (department) {
        return res.status(400).json({ errors: [{ msg: 'Department already exists' }] });
      }

      department = new Department({
        name,
        description,
        head
      });

      await department.save();
      res.json(department);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/departments/:id
// @desc    Update a department
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, head } = req.body;
    
    // Check if department exists
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ msg: 'Department not found' });
    }

    // Update fields
    if (name) department.name = name;
    if (description) department.description = description;
    if (head) department.head = head;

    await department.save();
    
    // Return updated department with populated head field
    const updatedDepartment = await Department.findById(req.params.id)
      .populate('head', 'name email');
      
    res.json(updatedDepartment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Department not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;