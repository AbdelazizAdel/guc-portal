const mongoose = require('mongoose');


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
    HOD:{
        type: String
    },
    courses:[String]
}
, {strict: false, timestamps: true}
);



module.exports ={model: mongoose.model('Department', DepartmentSchema),schema:DepartmentSchema};

