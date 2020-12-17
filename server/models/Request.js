const mongoose = require('mongoose');

const SlotSchema = require("./Slot.js").schema;

const RequestSchema = new mongoose.Schema({
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


module.exports = {model:mongoose.model("Request", RequestSchema),schema:RequestSchema};