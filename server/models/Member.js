const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SlotSchema = require('./Slot').schema;
const RequestSchema = require('./Request.js').schema;
const LocationSchema = require('./Location.js').schema;
const CourseSchema = require('./Course.js').schema;
const AttendanceSchema = require('./Attendance.js').schema;
const MemberSchema = new Schema(
    {
        id:{type:String,unique:true},
        name:String,
        email:String,
        password:String,
        salary:Number,
        officeLoc:[LocationSchema],
        gender:{type:String,enum:['male','female']},
        attendance:AttendanceSchema,
        assignedCourses:[CourseSchema],
        academicType:[String],
        requests:[RequestSchema],
        teachingSlots:[SlotSchema]


    }
);
module.exports = {model : mongoose.model('Member',MemberSchema), schema:MemberSchema};
