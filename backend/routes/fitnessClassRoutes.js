const express = require('express');
const { createFitnessClass, getFitnessClasses } = require('../controllers/fitnessClassController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getFitnessClasses);
router.post('/', protect, createFitnessClass);

module.exports = router;
