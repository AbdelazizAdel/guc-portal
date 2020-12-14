const mongoose = require('mongoose');
const PresenceSchema = require('./Presence.js').schema;
const Schema = mongoose.Schema;
const AttendanceSchema = new Schema(
    {
        dayoff:String,
        attendedHours:[Number],
        leaveBalance:Number,
        presence:[PresenceSchema]
    }
);
module.exports ={ model: mongoose.model('Attendance',AttendanceSchema), schema : AttendanceSchema};