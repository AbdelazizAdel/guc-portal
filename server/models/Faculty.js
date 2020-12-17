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
    departments:[String]
    
}, {strict: false, timestamps: true});


module.exports = mongoose.model('Faculty', FacultyScheme);