const mongoose = require('mongoose');

const MemberSchema = require('./Member.js').schema;

const SlotSchema = require('./Slot.js').schema;

const CourseSchema = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    TAs:[MemberSchema],
    instructors:[MemberSchema],
    slots:[SlotSchema],
    coordinator: MemberSchema,
    coverage: Number,
    totalSlots: Number
}, {strict: false, timestamps: true}
);


module.exports = {model:mongoose.model("Course", CourseSchema),schema:CourseSchema};