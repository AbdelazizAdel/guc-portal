const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
    id: String,
    sender: String,
    receiver: String,
    status: {type:String, enum:['Accepted', 'Rejected', 'Pending']},
    content: String,
    comment: String,
    type: {type:String, enum:['ReplacementSlot']}, //not complete, add others when needed
    submissionDate: Date,
    startDate: Date,
    duration: Number,
    slot: Number,
    attachmentURL : String
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);
