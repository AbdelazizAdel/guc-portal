const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
    id: String,
    sender: String,
    receiver: String,
    status: {type:String, enum:['Accepted', 'Rejected', 'Pending']},
    content: String,
    comment: String,
    type: {type:String, enum:['ReplacementSlot', 'AccidentalLeave', 'AnnualLeave', 'SickLeave', 'MaternityLeave', 'Compensation',
    'SlotLinking', 'DayOff']}, //not complete, add others when needed
    submissionDate: Date,
    startDate: Date,
    dayOff : Date,
    duration: Number,
    slot: String,
    attachmentURL : String
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);
