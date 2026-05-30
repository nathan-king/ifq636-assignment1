const FitnessClass = require('../models/FitnessClass');

const getFitnessClasses = async (req, res) => {
    try {
        const fitnessClasses = await FitnessClass.find().sort({ date: 1, time: 1 });
        res.json(fitnessClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

const updateFitnessClass = async (req, res) => {
    const { class: className, instructor, date, time, capacity, status } = req.body;

    if (!className || !instructor || !date || !time || capacity === undefined) {
        return res.status(400).json({ message: 'Class, instructor, date, time, and capacity are required' });
    }

    try {
        const fitnessClass = await FitnessClass.findById(req.params.id);

        if (!fitnessClass) {
            return res.status(404).json({ message: 'Fitness class not found' });
        }

        fitnessClass.class = className;
        fitnessClass.instructor = instructor;
        fitnessClass.date = date;
        fitnessClass.time = time;
        fitnessClass.capacity = capacity;
        fitnessClass.status = status || fitnessClass.status;

        const updatedFitnessClass = await fitnessClass.save();
        res.json(updatedFitnessClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createFitnessClass, getFitnessClasses, updateFitnessClass };
