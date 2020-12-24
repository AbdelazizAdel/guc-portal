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
            "attendance": req.body.attendance,
            "department":req.body.department
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
router.get('/instructors/:instructorId/coverage',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const instructorCourses =await Course.find({'instructors':{"$in":`${instructorId}`}});
    if(instructorCourses.length === 0){
        return res.status(403).send('You are not allowed to access this information');
    }
    const response = {}; 
    for(let i=0;i<instructorCourses.length;i++){
        const courseSlots = await Slot.find().and([{'instructor':{"$exists":true}},{'course':instructorCourses[i].id}]);
        const count = courseSlots.length;
        response[`${instructorCourses[i].name}`] = 100.0*count/instructorCourses[i].numSlots;
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
    for(let i = 0 ; i<instructorCourses.length;i++){
        const courseId = {};
        courseId.courseId= instructorCourses[i].name;
        courseId.courseName = instructorCourses[i].name;
        coursesId.push(courseId);
    }
    const response ={courses:coursesId};
    res.status(200).send(response);
});
router.get('/instructors/:instructorId/courses/:courseId/staff-members',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const courseId = req.params.courseId;
    const course = await Course.findOne({'id':`${courseId}`});
    if(course == null){
        return res.status(404).send('Course Not found');
    }
    if(!course.instructors.includes(instructorId)){
        return res.status(403).send('You don\'t have access to this information');
    }
    let queries = [];
    let TAs = [];
       for(let j = 0;j<course.TAs.length;j++){
           TAs.push({'id':`${course.TAs[j]}`});
       }
       const query1 = StaffMember.find().or(TAs);
       const instructors = [];
       for(let j=0;j<course.instructors.length;j++){
           instructors.push({'id':`${course.instructors[j]}`});
       }
       const query2 = StaffMember.find().or(instructors);
       queries.push(query1);
       queries.push(query2);
       Promise.allSettled(queries).then((result)=>{
        let response ={};
        let output = [];
        let TAsAssigned = false;
        for(let i = 0; i <result.length;i++){
            if(result[i].status ==='fulfilled'){
            const desiredOutput = result[i].value.map((elem)=>{
             return {id:elem.id,name:elem.name};
         });
         TAsAssigned = true;
         output.push(desiredOutput);
        }
        else{
            output.push([{id:'Not assigned yet',name:'Not assigned yet'}]);
        }
        }
            response[`${course.name}`] = {TAsAssigned:TAsAssigned,TAs:output[0],instructors:output[1]};
            res.status(200).send(response);

        }
       )

});
/**
 * This route requires a body in the following structure
 *  {
 *  instrudctorId : value
 * }
 *  view which slot is assigned to which academic member
 *  the output is of structure
 *  {
 *      slotsInformation:[{ slotday : value , slotPeriod : value , slotLocation : value , instructor : value , course : value}]
 *  }
 */
router.get('/courses/:courseId/slots-assignment',async(req,res)=>{
    const courseId = req.params.courseId;
    const instructorId = req.body.instructorId;
    if((await StaffMember.find({'id':instructorId})) === null ){
        return res.status(404).send('Instructor not found');
    }
    const course = await Course.findOne({'id':courseId});

    if(!course.instructors.includes(instructorId)){
        return res.status(403).send('This is not an instructor to this course');
    }
    let response = {};
    const courseSlots = await Slot.find({'course':courseId});
    let allSlots =[];
    for(let i=0;i<courseSlots.length;i++){
        const member =courseSlots[i].instructor==null?'Not Assigned yet':(await StaffMember.findOne({'id':courseSlots[i].instructor})).name;
        const resultstructure ={slotDay:courseSlots[i].day,slotPeriod:courseSlots[i].period,slotLocation:courseSlots[i].location,instructor:member,course:course.name};
        allSlots.push(resultstructure);        
    }
    response['slotsInformation']=allSlots;
    res.status(200).send(response);
});
router.get('/staff-members/:instructorId/department',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const instructor = await StaffMember.findOne({'id':`${instructorId}`});
    if(instructor == null){
        return res.status(404).send('There doesn\'t exist an Instructor with such Id.');
    }
    const instructorCourses = await Course.findOne({'instructors':{"$in":`${instructorId}`}});
    if(instructorCourses == null){
        return res.status(403).send('The Id provided is not of an instructor, so you can\'t access this information!!');
    }
    let membersId = [];
    const members = await StaffMember.find({'department':instructor.department});
    for(let i=0;i<members.length;i++){
        membersId.push({memberId:members[i].id,memberName:members[i].name});
    }
    res.status(200).send({staffMembers:membersId});

});
router.get('/staff-members/:instructorId/department/:staffMemberId',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const memberId = req.params.staffMemberId; // a member from the same department
    const instructor = await StaffMember.findOne({'id':instructorId});
    const staffMember =await StaffMember.findOne({'id':memberId});
    if(instructor == null){
        return res.status(404).send('Instructor not found!!');
    }
    else if(staffMember == null){
        return res.status(404).send('The staff Member you are searching for is not found');
    }
    const instructorCourses = await Course.findOne({'instructors':{"$in":`${instructorId}`}});
    if(instructorCourses == null){
        return res.status(403).send('The Id provided is not of an instructor, so you can\'t access this information!!');
    }
    if(instructor.department!==staffMember.department){
        return res.status(403).send('The Instructor and the staff member are not in the same department.')
    }
    res.status(200).send({memberName:staffMember.name,memberEmail:staffMember.email,memberGender:staffMember.gender,
                         memberDayoff:staffMember.dayOff,memberOfficeLoc:staffMember.officeLoc,memberDepartment:staffMember.department});

});
// get all staff members who share the same courses as the instructor
router.get('/staff-members/:instructorId/courses',async(req,res)=>{
    const instructorId = req.params.id;
    const instructor = await StaffMember.findOne({'id':instructorId});
    if(instructor == null){
        return res.status(404).send('There doesn\'t exist an Instructor with such Id.');
    }
    const instructorCourses = await Course.find({'instructors':{"$in":`${instructorId}`}});
    if(instructorCourses == null){
        return res.status(403).send('The Id provided is not of an instructor, so you can\'t access this information!!');
    }
    const response = {};
    let queries = [];
    for(let i = 0 ;i < instructorCourses.length;i++){
       const TAs = [];
       for(let j=0;j<instructorCourses[i].TAs.length;j++){
           TAs.push({'id':`${instructorCourses[i].TAs[j]}`});
       }
       const query1 = StaffMember.find().or(TAs);
       const instructors = [];
       for(let j=0;j<instructorCourses[i].instructors.length;j++){
           instructors.push({'id':`${instructorCourses[i].instructors[j]}`});
       }
       const query2 = StaffMember.find().or(instructors);
       queries.push(query1);
       queries.push(query2);
    }
    Promise.allSettled(queries).then((result)=>{
        let output = [];
        let TAsAssigned = [];
        for(let i = 0; i <result.length;i++){
            if(result[i].status ==='fulfilled'){
            const desiredOutput = result[i].value.map((elem)=>{
             return {id:elem.id,name:elem.name};
         });
         TAsAssigned.push(true);
         output.push(desiredOutput);
        }
        else{
            TAsAssigned.push(false);
            output.push([{id:'Not assigned yet',name:'Not assigned yet'}]);
        }
        }
         for(let i = 0, j = 0;i<instructorCourses.length;i++,j+=2){
            response[`${instructorCourses[i].name}`] = {TAsAssigned:TAsAssigned[i],TAs:output[j],instructors:output[j+1]};
         
        }
        res.status(200).send(response);
    })

});

router.get('/instructors/:instructorId/staff-members/:staffMemberId',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const memberId = req.params.staffMemberId; // a member from the same course
    const instructor = await StaffMember.findOne({'id':instructorId});
    const staffMember =await StaffMember.findOne({'id':memberId});
    if(instructor == null){
        return res.status(404).send('Instructor not found!!');
    }
    else if(staffMember == null){
        return res.status(404).send('The staff Member you are searching for is not found');
    }
    const instructorCourses = await Course.findOne({'instructors':{"$in":`${instructorId}`}}).or([{'instructors':{"$in":`${memberId}`}},{'TAs':{"$in":`${memberId}`}}]);
    if(instructorCourses == null){
        return res.status(403).send('You are not allowed to view this information!!');
    }
    res.status(200).send({memberName:staffMember.name,memberEmail:staffMember.email,memberGender:staffMember.gender,
                         memberDayoff:staffMember.dayOff,memberOfficeLoc:staffMember.officeLoc,memberDepartment:staffMember.department});

});


router.get('/instructors/:instructorId/courses/:courseid/unassigned-slots',async(req,res)=>{
    const instructorId = req.params.instructorId;
    const courseId = req.params.courseid;
    const course = await Course.findOne({'id':`${courseId}`});
    if(!course.instructors.includes(instructorId)){
        return res.status(403).send('You are not allowed to view these course Information');
    }
    courseTAs = [...course.TAs];
    courseInstructors = [...course.instructors];
    const unAssignedSlots = await Slot.find().and([{'course':courseId},{'$or':[{'instructor':{"$exists":false}},{'instructor':null}]}]);
    response= {unAssignedSlots:unAssignedSlots.map((elem)=>{return {day:elem.day,period:elem.period,location:elem.location,slotType:elem.slotType,course:course.name    }}),courseTAs:courseTAs,courseInstructors:courseInstructors};
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
        return res.status(403).send('This academic member can\'t be assigned to this course');
    }
    const slot = await Slot.findOne({'id':slotId});
    const isMemberfree = await Slot.find().and([{'instructor':academicMemberId},{'day':slot.day},{'period':slot.period}]);
    if(isMemberfree.length!==0){
        return res.status(403).send('This staff member is not available to be assigned to this slot!!');
    }
    await Slot.updateOne({"id":slotId},{"instructor":academicMemberId});
    res.status(200).send('The Slot was modified correctly');

});
router.patch('/instructors/:instructorId/slots/:slotId',async(req,res)=>{
    const slotId =req.params.slotId;
    const instructorId = req.params.instructorId;
    const courseId = req.body.courseId;    
    const course = await Course.findOne({'id':courseId});
    if(!course.instructors.includes(`${instructorId}`)){
        return res.status(403).send('You are not allowed to remove assignment of a slot in this course!!');
    }
    await Slot.updateOne({"id":slotId},{"instructor":null});
    res.status(200).send('The Slot was modified correctly');

});
router.patch('/instructors/:instructorId/courses/:courseId/coordinator/:memberId',async(req,res)=>{
    instructorId = req.params.instructorId;
    courseId = req.params.courseId;
    memberId = req.params.memberId;
    const course = await Course.findOne({'id':`${courseId}`});
    if(course == null){
        return res.status(404).send('Course not found!!!');
    }
    if(!course.instructors.includes(instructorId)){
        return res.status(403).send('You don\'t have access to do this request!!');
    }
    if(!course.TAs.includes(memberId)){
        return res.status(403).send('You can\'t assign this member to be a coordinator!!');
    }
    await Course.updateOne({'id':`${courseId}`},{'coordinator':`${memberId}`});
    res.status(200).send('Course Coordinator added successfully!!');


})



module.exports = router;