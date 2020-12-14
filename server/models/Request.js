const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
    to: String,
    from: String,
    content: String,
    status: String,
    type: String,
    slot: Slot,
    day: Number,
    submissionDate: Date,
    duration: Number,
    startDate: Date
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);