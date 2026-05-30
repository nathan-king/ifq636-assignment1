const express = require('express');
const { createFitnessClass } = require('../controllers/fitnessClassController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createFitnessClass);

module.exports = router;
