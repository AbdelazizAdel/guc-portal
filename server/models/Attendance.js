const mongoose = require('mongoose');
const Presence = require('./Presence.js');
const Schema = mongoose.Schema;
const AttendanceSchema = new Schema(
    {
        dayoff:String,
        attendedHours:[Number],
        leaveBalance:Number,
        presence:[Presence]
    }
);
module.exports = mongoose.model('Attendance',AttendanceSchema);