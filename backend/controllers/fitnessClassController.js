const FitnessClass = require('../models/FitnessClass');

const createFitnessClass = async (req, res) => {
    const { class: className, instructor, date, time, capacity, status } = req.body;

    if (!className || !instructor || !date || !time || capacity === undefined) {
        return res.status(400).json({ message: 'Class, instructor, date, time, and capacity are required' });
    }

    try {
        const fitnessClass = await FitnessClass.create({
            class: className,
            instructor,
            date,
            time,
            capacity,
            status,
        });

        res.status(201).json(fitnessClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createFitnessClass };
