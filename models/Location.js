const mongoose = require('mongoose');


const LocationScheme = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    roomNum:{
        type: String,
        required: true
    },
    capacity: Number,
    type: String
}, {strict: false, timestamps: true}
);

module.exports = mongoose.model("Location", LocationScheme);