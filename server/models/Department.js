const mongoose = require('mongoose');

const Member = require('./Member.js');
const Course = require("./Course.js");

const DepartmentScheme = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    teachingStaff:[Member],
    HOD:{
        type: Member
    },
    courses:[Course]
}
, {strict: false, timestamps: true}
);


module.exports = mongoose.model('Department', DepartmentScheme);