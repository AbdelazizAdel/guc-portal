const mongoose = require('mongoose');

const SlotSchema = require("./Slot.js").schema;

const RequestSchema = new mongoose.Schema({
    to: String,
    from: String,
    content: String,
    status: String,
    type: String,
    slot: SlotSchema,
    day: Number,
    submissionDate: Date,
    duration: Number,
    startDate: Date
}, {strict: false, timestamps: true});


module.exports = {model:mongoose.model("Request", RequestSchema),schema:RequestSchema};