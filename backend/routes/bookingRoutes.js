const express = require('express');
const { cancelBooking, createBooking, getBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getBookings);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
