const express = require('express');
const { createFitnessClass, getFitnessClasses, updateFitnessClass } = require('../controllers/fitnessClassController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getFitnessClasses);
router.post('/', protect, adminOnly, createFitnessClass);
router.put('/:id', protect, adminOnly, updateFitnessClass);

module.exports = router;
