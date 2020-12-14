const mongoose = require('mongoose');

const MemberSchema = require('./Member.js').schema;
const CourseSchema = require("./Course.js").schema;

const DepartmentSchema = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    teachingStaff:[MemberSchema],
    HOD:{
        type: MemberSchema
    },
    courses:[CourseSchema]
}
, {strict: false, timestamps: true}
);



module.exports ={model: mongoose.model('Department', DepartmentSchema),schema:DepartmentSchema};
