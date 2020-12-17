const mongoose = require('mongoose');


const LocationScheme = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        required: true
    },
    capacity: Number,
    type: String
}, {strict: false, timestamps: true}
);

module.exports = mongoose.model("Location", LocationScheme);