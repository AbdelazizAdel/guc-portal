const mongoose = require('mongoose');

const DepartmentSchema = require('./Department.js').schema;

const FacultySchema = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    departments:[DepartmentSchema]
    
}, {strict: false, timestamps: true});


module.exports = {model:mongoose.model('Faculty', FacultySchema),schema:DepartmentSchema};