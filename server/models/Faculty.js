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
<<<<<<< HEAD
    departments:[Department.schema]
=======
    departments:[DepartmentSchema]
>>>>>>> 4bf2fd047ccc3b6c82bc7d234bdd34f99e419fee
    
}, {strict: false, timestamps: true});


module.exports = {model:mongoose.model('Faculty', FacultySchema),schema:DepartmentSchema};