const express = require('express');
const { createBooking, getBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getBookings);
router.post('/', protect, createBooking);

module.exports = router;
