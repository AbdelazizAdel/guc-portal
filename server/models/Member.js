const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Slot = require('./Slot');
const Request = require('./Request.js');
const Location = require('./Location.js');
const Course = require('./Course.js');
const Attendance = require('./Attendance.js');
const MemberSchema = new Schema(
    {
        id:{type:String,unique:true},
        name:String,
        email:String,
        password:String,
        salary:String,
        officeLoc:[Location],
        gender:{type:String,enum:['male','female']},
        attendance:Attendance,
        assignedCourses:[Course],
        academicType:[String],
        requests:[Request],
        teachingSlots:[Slot]


    }
);
module.exports = mongoose.model('Member',MemberSchema);