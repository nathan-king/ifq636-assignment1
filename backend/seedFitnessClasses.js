const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const FitnessClass = require('./models/FitnessClass');

dotenv.config();

const fitnessClasses = [
    {
        class: 'Yoga',
        instructor: 'Jack Jones',
        date: new Date('2026-06-03'),
        time: '7:00 PM',
        capacity: 20,
        status: 'confirmed',
    },
    {
        class: 'Pilates',
        instructor: 'Jessica Smith',
        date: new Date('2026-06-04'),
        time: '7:00 PM',
        capacity: 15,
        status: 'confirmed',
    },
    {
        class: 'Pump',
        instructor: 'Thomas Max',
        date: new Date('2026-06-06'),
        time: '7:00 PM',
        capacity: 18,
        status: 'confirmed',
    },
];

const seedFitnessClasses = async () => {
    await connectDB();

    for (const fitnessClass of fitnessClasses) {
        await FitnessClass.findOneAndUpdate(
            {
                class: fitnessClass.class,
                instructor: fitnessClass.instructor,
                date: fitnessClass.date,
                time: fitnessClass.time,
            },
            fitnessClass,
            { new: true, upsert: true, runValidators: true }
        );
    }

    console.log('Fitness classes seeded successfully');
    await mongoose.connection.close();
};

seedFitnessClasses().catch(async (error) => {
    console.error('Fitness class seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
});
