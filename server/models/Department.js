
const mongoose = require('mongoose');


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
    HOD:{
        type: String
    }
}
, {strict: false, timestamps: true}
);


module.exports = mongoose.model('Department', DepartmentScheme);
