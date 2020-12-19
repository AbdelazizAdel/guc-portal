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
    const memberCourses =await Course.find().or([{'instructors':{"$in":`${memberId}`}},{'TAs':{"$in":`${memberId}`}}]);
    const response = {}; 
    for(let i=0;i<memberCourses.length;i++){
        const courseSlots = await Slot.find().and([{'instructor':{"$exists":true}},{'course':memberCourses[i].id}]);
        const count = courseSlots.length;
        response[`${memberCourses[i].name}`] = 100.0*count/memberCourses[i].numSlots;
    }
    res.status(200).send(response);

});



module.exports = router;