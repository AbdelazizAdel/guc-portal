const express= require('express');
const router= express.Router();

const DepartmentModel = require('../models/Department.js');
const MemberModel = require('../models/Member.js');
const RequestModel = require('../models/Request.js');
const SlotModel = require('../models/Slot.js');
const AttendanceModel = require('../models/Attendance.js');
const CourseModel = require('../models/Course.js');
const FacultyModel = require('../models/Faculty.js');
const LocationModel = require('../models/Location.js')

router.use(express.json());


//* Add Update or Delete a Location 

router.route("/opLocation/:id")
.delete(async(req,res)=>{
  
    LocationModel.findByIdAndDelete(req.params.id, (err,doc)=>{
        if(err) {
            
            res.status(400).send("Couldnt Find a Location");
            
            return}
        else{
            res.status(200).send("Deleted Successfully");

        }
    })

})
.post(async(req,res) =>{

    var body = req.body
    try {
        LocationModel.findByIdAndUpdate(req.params.id,req.body,(err,doc) =>{
            if(err) {
                res.status(400).send("Couldnt Add Location, try again !");
                return
            }
            else{
                res.status(200).send("Location Added Successfully");
            }
        })
    
        
    } catch (error) {
        res.status(400).send("Couldnt Add Location, Data is invalid !");
        
    }
})

router.route("/addLocation")
.post(async(req,res) =>{

    var body = req.body
    try {
        const location  = new LocationModel({
            "name": body.name,
            "capacity": body.capacity,
            "type": body.type
        })
        location.save((err,doc)=>{
            if(err) {
            res.status(400).send("Couldnt Add Location, try again !");
            return
        }
        else{
            res.status(200).send("Location Added Successfully");
        }
        })
        
    } catch (error) {
        
    }
   
})

// * update or delete a Faculty
router.route("/opFaculty/:id")
.delete(async(req, res)=>{

    var FacultyID = req.body.id
    FacultyModel.findByIdAndRemove(req.params.id,(err,doc)=>{
        if(err){ 
            res.status(400).send("Error Deleting Faculty");
            return console.log(err);
        }
        console.log('Faculty  Deleted Successfully');
        res.status(200).send('Faculty Deleted Successfully'); 
    });
    })

.post(async(req, res)=>{
const faculty = new FacultyModel({
    "id": body.id,
    "name": body.name,
    "departments": body.departments
})

FacultyModel.findByIdAndUpdate(req.params.id,req.body,(err,doc)=>{
    if(err){ 
        res.status(400).send('Faculty failed to update');
         return console.log(err);}

    else{
            res.status(200).send('Faculty updated Successfully');
        }
    })
        })

// * Add a faculty
router.route("/addFaculty")
.post(async(req, res)=>{
const body = req.body
const facultyID = body.id

const faculty = new FacultyModel({
    "id": body.id,
    "name": body.name,
    "departments": body.departments
})
faculty.save((err,doc) =>{
    if(err) {
        res.status(400).send("Failed to add Course")
        return
    }
    else{
        res.status(200).send("Addd Course Successfully")
    }

})
})

//* Add Delete Update a Department under a faculty


// * Add A Dept under a faculty 
router.route("/addDepartment")
.post( async(req,res)=>{
    // Faculty ID
    // A course Object 

    const body = req.body
    try {
        const Dept = new DepartmentModel({
            "id": body.id,
            "name": body.name,
            "HOD": body.HOD
        });
        FacultyModel.findById(body.id,(err,doc) => {
            if(err){
                res.status(400).send("Error Locating the department")
                return
            }
            else{
                Dept.save((err,doc) => {
                    if(err) return console.log(err);
                    console.log("Added Successfully");
                    res.status(200).send('Added');
                    doc.departments.push(course.id)
                }); 
            }
        })
    } catch (error) {
        res.status(400).send("Error in Input Data")
        return
    }
})
// * Delete Update a Department under a faculty
router.route("/opDepartment/:id")
.post(
    async(req, res) =>{
        DepartmentModel.findByIdAndUpdate(req.params.id,req.body,(err,doc)=>{
            if(err){ 
                res.status(400).send('Department failed to update');
                 return console.log(err);}
        
            else{
                    res.status(200).send('Department updated Successfully');
                }

        })
})
.delete(
    async(req, res) =>{
        DepartmentModel.findByIdAndDelete(req.params.id,(err,doc) => {
            if (err){
                res.status(400).send("Failed to Delete Department")
                return
            }
            else{
                console.log('Department Deleted Successfully');
                res.status(200).send('Department Deleted Successfully');
            }
        })
    }
)

// * Add update or delete a course

router.route("/opCourse/:id")
.delete(async(req, res)=>{
    CourseModel.findByIdAndDelete(req.params.id,(err,doc)=>{
        if(err) return console.log(err);
        console.log('Course Deleted Successfully');
        res.status(200).send('Course Deleted Successfully');  
    });
    })

.post(async(req, res)=>{

CourseModel.findByIdAndUpdate(req.params.id,req.body,(err,doc) => {
    if(err){
        res.status(400).send("Coulndt Update Course");
    }
    else{
        res.status(200).send("Updated Course Successfully");
    }
})
});
// * AddCourse
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
        if(err){   
            res.status(400).send('Course Deleted Successfully');
            return console.log(err);}
        else
        { 
        console.log("Updated Successfully");
        res.status(200).send('Course updated Successfully');
        }
    
    }
        )

})



