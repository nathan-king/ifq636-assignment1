const Booking = require('../models/Booking');
const FitnessClass = require('../models/FitnessClass');

const createBooking = async (req, res) => {
    const { fitnessClassId } = req.body;

    if (!fitnessClassId) {
        return res.status(400).json({ message: 'Fitness class is required' });
    }

    try {
        const fitnessClass = await FitnessClass.findById(fitnessClassId);

        if (!fitnessClass) {
            return res.status(404).json({ message: 'Fitness class not found' });
        }

        if (fitnessClass.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot book a cancelled class' });
        }

        const existingBooking = await Booking.findOne({
            user: req.user._id,
            fitnessClass: fitnessClassId,
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Class already booked' });
        }

        const bookedCount = await Booking.countDocuments({
            fitnessClass: fitnessClassId,
            status: 'booked',
        });

        if (bookedCount >= fitnessClass.capacity) {
            return res.status(400).json({ message: 'Class is full' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            fitnessClass: fitnessClassId,
            userRole: req.user.role,
        });

        res.status(201).json(booking);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Class already booked' });
        }

        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking };
