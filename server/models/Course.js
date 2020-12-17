const mongoose = require('mongoose');


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
    coordinator: String,
    TAs:[String],
    instructors:[String],
    numSlots: Number
}, {strict: false, timestamps: true}
);


module.exports = {model:mongoose.model("Course", CourseSchema),schema:CourseSchema};