const mongoose = require('mongoose');

const fitnessClassSchema = new mongoose.Schema({
    class: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
        required: true,
    },
});

module.exports = mongoose.model('FitnessClass', fitnessClassSchema);
