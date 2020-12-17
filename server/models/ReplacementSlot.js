const mongoose = require('mongoose');

const ReplacementSlotScheme = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    day: Number,
    period: Number,
    date: Date, 
    location: String, 
    slotType: String, 
    course: String,
    instructor: String
});


module.exports = mongoose.model('ReplacementSlot', ReplacementSlotScheme);