const express = require('express');
const { createFitnessClass, getFitnessClasses } = require('../controllers/fitnessClassController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getFitnessClasses);
router.post('/', protect, adminOnly, createFitnessClass);

module.exports = router;
