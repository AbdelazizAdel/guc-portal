const express = require('express');

const StaffMember = require('../models/StaffMember.js');
const Slot = require('../models/Slot.js');
const Course = require('../models/Course.js');
const router = express.Router();
router.use(express.json());
router.post('/StaffMembers',(req,res)=>{

    try{
        const member = new StaffMember({
            "id": req.body.id,
            "name": req.body.name,
            "email": req.body.email,
            "gender": req.body.gender,
            "salary": req.body.salary,
            "dayOff": req.body.dayOff,
            "leaves": req.body.leaves,
            "password": req.body.password,
            "startDay": req.body.startDay,
            "loggedIn": req.body.loggedIn,
            "officeLoc": req.body.officeLoc,
            "attendance": req.body.attendance
          })
        console.log(typeof(member));
        member.save((err,doc)=>{
            if(err) return console.log(err);
            console.log('Document inserted successfully');
        });
        res.status(200).send('Member added successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');

    }
})
router.post('/Courses',(req,res)=>{
    try {
        course = new Course({
        'id':req.body.id,
        'name':req.body.name,
        'coordinator':req.body.coordinator,
        'TAs':req.body.TAs,
        'instructors':req.body.instructors,
        'numSlots':req.body.numSlots
    });
    course.save((err,doc)=>{
        if(err) return console.log(err);
        console.log('Course inserted successfully');
    });
    res.status(200).send('course added successfully');
}
catch(err){
    console.log(err);
    res.status(404).send('fih moshkla ya mealem');
}
});
router.post('/Slots',(req,res)=>{
    try {
        slot = new Slot({
        'id':req.body.id,
        'day':req.body.day,
        'period':req.body.period,
        'location':req.body.location,
        'slotType':req.body.slotType,
        'course':req.body.course,
        'instructor':req.body.instructor
    });
    slot.save((err,doc)=>{
        if(err) return console.log(err);
        console.log('slot created successfully');
    });
    res.status(200).send('slot created successfully');
}
catch(err){
    console.log(err);
    res.status(404).send('fih moshkla ya mealem');
}
});
router.get('/members/:id/coverage',async(req,res)=>{
    const memberId = req.params.id;
    const memberCourses =await Course.find({'instructors':{"$in":`${memberId}`}});
    const response = {}; 
    for(let i=0;i<memberCourses.length;i++){
        const courseSlots = await Slot.find().and([{'instructor':{"$exists":true}},{'course':memberCourses[i].id}]);
        const count = courseSlots.length;
        response[`${memberCourses[i].name}`] = 100.0*count/memberCourses[i].numSlots;
    }
    res.status(200).send(response);

});
// this route returns the courseIds this instructor is responsible for
router.get('/instructors/:id/courses',async(req,res)=>{
    const instructorId = req.params.id;
    const instructorCourses = await Course.find({'instructors':{"$in":`${instructorId}`}});
    //console.log(instructorCourses);
    if(instructorCourses.length == 0){
        return res.status(403).send('You are not allowed to assign slots');
    }
    let coursesId = [];
    for(let i =0 ; i<instructorCourses.length;i++){
        coursesId.push(instructorCourses[i].id);
    }
    const response ={courses:coursesId};
    res.status(200).send(response);
});
router.get('/instructors/:id/courses/:courseid',async(req,res)=>{
    const instructorId = req.params.id;
    const courseId = req.params.courseid;
    const course = await Course.findOne({'id':`${courseId}`});
    console.log(course.instructors);
    if(!course.instructors.includes(instructorId)){
        return res.status(403).send('You are not allowed to view these course Information');
    }
    courseTAs = [...course.TAs];
    courseInstructors = [...course.instructors];
    const unAssignedSlots = await Slot.find().and([{'course':courseId},{'instructor':{"$exists":false}}]);
    response= {unAssignedSlots:unAssignedSlots,courseTAs:courseTAs,courseInstructors:courseInstructors};
    res.status(200).send(response);
});
/**
 *  This request requires a body in the following structure
 * {
 *  instructorId :value,
 *  courseId :value
 * }
 */
router.patch('/academic-members/:memberId/slots/:slotId',async(req,res)=>{
    const academicMemberId = req.params.memberId;
    const slotId =req.params.slotId;
    const instructorId = req.body.instructorId;
    const courseId = req.body.courseId;
    const member = await StaffMember.find({'id':academicMemberId});
    if(member.length === 0){ 
        return res.status(404).send('The member you are trying to assign is not found!!');}
    
    const course = await Course.findOne({'id':courseId});
    if(!course.instructors.includes(`${instructorId}`)){
        return res.status(403).send('You are not allowed to assign a slot to an academic member!!');
    }
    if(!(course.instructors.includes(`${academicMemberId}`)||course.TAs.includes(`${academicMemberId}`))){
        return res.status(403).send('This teaching assistant can\'t be assigned to this course');
    }
    const slot = await Slot.findOne({'id':slotId});
    const isMemberfree = await Slot.find().and([{'instructor':academicMemberId},{'day':slot.day},{'period':slot.period}]);
    if(isMemberfree.length!==0){
        return res.status(403).send('This staff member is not available to be assigned to this slot!!');
    }
    await Slot.updateOne({"id":slotId},{"instructor":academicMemberId});
    res.status(200).send('The Slot was modified correctly');

})



module.exports = router;