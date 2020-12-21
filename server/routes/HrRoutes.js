const express= require('express');
const router= express.Router();

const DepartmentModel = require('../models/Department.js');
const MemberModel = require('../models/Member.js');
const RequestModel = require('../models/Request.js');
const SlotModel = require('../models/Slot.js');
const AttendanceModel = require('../models/Attendance.js');
const CourseModel = require('../models/Course.js');

router.use(express.json());

// * Add update or delete a course
router.route("/opCourse")
.delete(async(req, res)=>{

    var courseID = req.body.id
    CourseModel.findByIdAndRemove(courseID,(err,doc)=>{
        if(err) return console.log(err);
        console.log('Course Deleted Successfully');
        res.status(200).send('Course Deleted Successfully');
        
    });
    })
.post(async(req, res)=>{

var courseID = req.body.id 
const body = req.body
const course = new CourseModel({
    "id":body.id,
    "name":body.name,
    "coordinator": req.body.coordinator,
    "TAs":body.TAs,
    "instructors":body.instructors,
    "numSlots": body.numSlots,
    "mainDepartment":body.mainDepartment,
    "teachingDepartments" : body.teachingDepartments
}
)
CourseModel.findByIdAndDelete(courseID,(err,doc) =>{
    if(err) return console.log(err);
    else{
        course.save((err,doc) => {
            if(err) return console.log(err);
            console.log("Updated Successfully");
            res.status(200).send('Course updated Successfully');
        })
        
    }
})

});

router.route("/addCourse")
.post(async(req, res)=>{

    const body = req.body
    const course = new CourseModel({
        "id":body.id,
        "name":body.name,
        "coordinator": req.body.coordinator,
        "TAs":body.TAs,
        "instructors":body.instructors,
        "numSlots": body.numSlots,
        "mainDepartment":body.mainDepartment,
        "teachingDepartments" : body.teachingDepartments
    }
    )
    course.save((err,doc) => {
        if(err) return console.log(err);
        console.log("Updated Successfully");
        res.status(200).send('Course updated Successfully');})

})