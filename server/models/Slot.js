const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Location = require('./Location.js');
const Course = require('./Course.js');
const Member = require('./Member.js');
const SlotSchema = new Schema({
    startDate:  Date,
    endDate: Date,
    location: Location,
    course:Course,
    instructor:Member,
    slotType:String
}
);
module.exports = mongoose.model('Slot',SlotSchema);