const mongoose = require('mongoose');

const Slot = require("./Slot.js");

const RequestScheme = new mongoose.Schema({
<<<<<<< HEAD
    id: {type: String, unique: true, required: true},
=======
    id: String,
>>>>>>> 76a1e9e95f95a8a6f04f70d92363f6230ed971d4
    sender: String,
    receiver: String,
    status: {type:String, enum:['Accepted', 'Rejected', 'Pending']},
    content: String,
    comment: String,
    type: {type:String, enum:['ReplacementSlot', 'AccidentalLeave', 'AnnualLeave', 'SickLeave', 'MaternityLeave', 'CompensationLeave',
    'SlotLinking', 'DayOff']}, //not complete, add others when needed
    submissionDate: Date,
    startDate: Date,
    dayOff : Date,
    duration: Number,
    slot: String,
    attachmentURL : String
}, {strict: false, timestamps: true});


module.exports = mongoose.model("Request", RequestScheme);
