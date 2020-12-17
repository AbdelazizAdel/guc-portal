const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
    to: String,
    from: String,
    status: String,
    content: String,
    comment: String,
    type: String,
    submissionDate: Date,
    startDate: Date,
    duration: Number,
    slot: Number
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);