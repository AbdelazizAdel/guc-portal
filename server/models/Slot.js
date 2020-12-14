const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = require('./Location.js').schema;
const CourseSchema = require('./Course.js').schema;
const MemberSchema = require('./Member.js').schema;
const SlotSchema = new Schema({
    startDate:  Date,
    endDate: Date,
    location: LocationSchema,
    course:CourseSchema,
    instructor:MemberSchema,
    slotType:String
}
);
module.exports = {model:mongoose.model('Slot',SlotSchema),schema:SlotSchema};