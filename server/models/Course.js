const mongoose = require('mongoose');


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
    coordinator: String,
    TAs:[String],
    instructors:[String],
    numSlots: Number
}, {strict: false, timestamps: true}
);


module.exports = mongoose.model("Course", CourseScheme)