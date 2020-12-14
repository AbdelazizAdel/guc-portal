const mongoose = require('mongoose');

const Department = require('./Department.js');

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
    departments:[Department.schema]
    
}, {strict: false, timestamps: true});


module.exports = mongoose.model('Faculty', FacultyScheme);