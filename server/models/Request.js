const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
    sender: String,
    receiver: String,
    status: String,
    content: String,
    comment: String,
    type: String,
    submissionDate: Date,
    startDate: Date,
    duration: Number,
    slot: String,
    attachmentURL : String
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);
