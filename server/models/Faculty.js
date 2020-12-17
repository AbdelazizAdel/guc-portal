const mongoose = require('mongoose');

const FacultyScheme = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    departments:[Number]
    
}, {strict: false, timestamps: true});


module.exports = {model:mongoose.model('Faculty', FacultySchema),schema:DepartmentSchema};