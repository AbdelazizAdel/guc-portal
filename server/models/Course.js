const mongoose = require('mongoose');

const Member = require('./Member.js');

const Slot = require('./Slot.js');

const CourseScheme = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    TAs:[Member],
    instructors:[Member],
    slots:[Slot],
    coordinator: Member,
    coverage: Number,
    totalSlots: Number
}, {strict: false, timestamps: true}
);


module.exports = mongoose.model("Course", CourseScheme);