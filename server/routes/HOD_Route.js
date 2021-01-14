const express= require('express');
const router= express.Router();
const Joi = require('joi');

const StaffMemberModel = require('../models/StaffMember');
const CourseModel = require('../models/Course');
const DepartmentModel = require('../models/Department');
const RequestModel = require('../models/Request');
const SlotModel = require('../models/Slot');
const {authentication} = require('./middleware');

router.get('/courses',[authentication], async(req, res)=>{
    const department = await DepartmentModel.findOne({HOD: req.body.member.id});
    if(!department)
        return res.send('invalid data')
    let courses = await CourseModel.find({mainDepartment: department.id});

    res.send(courses.map(course => {return {id: course.id, name: course.name}}));    
})

router.get('/courses/:id',[authentication], async(req, res)=>{
    const department = await DepartmentModel.findOne({HOD: req.body.member.id});
    if(!department)
        return res.send('invalid data')
    let course = await CourseModel.findOne({mainDepartment: department.id, id: req.params.id});

    res.send(await getCourseData(course));    
})

async function getCourseData(course) {
    return {id: course.id, name: course.name,
        coordinator: course.coordinator,
        TAs: await viewTAs(course.TAs),
        instructors: await viewInstructors(course.instructors),
        numSlots: course.numSlots,
        mainDepartment : course.mainDepartment,
        teachingDepartments : course.teachingDepartments
    }
}

async function viewInstructors(instructors) {
    let staff = [];

    for(instructorId of instructors){
        const instructor = await StaffMemberModel.findOne({id: instructorId});
        staff.push(getProfile(instructor));
    }
    
    return staff;
}

async function viewTAs(TAs) {
    let staff = [];
    for(TA_Id of TAs){
        const TA = await StaffMemberModel.findOne({id: TA_Id});
        staff.push(getProfile(TA));
    }

    return staff;
}

router.post('/assignInstructor',[authentication] ,async(req, res)=>{
    const schema = Joi.object({
        courseId: Joi.string().min(8).max(16).required(),
        instructorId: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required(),
        member: Joi.object({id: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required()}).required()
    });
    const{error, value}= schema.validate(req.body, {allowUnknown: true});

    if(!error){
        let courseId = value.courseId;
        let instructorId = value.instructorId;
        let HOD = value.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD});
        if(!department)
            return res.send('invalid data')    
        if(!isValid(courseId, HOD, instructorId)){
            console.log('Invalid course or instructor');
            res.status(403).send('Invalid course or instructor');
        }else{
            await CourseModel.findOneAndUpdate({id: courseId}, {$addToSet: {instructors: instructorId}}, {runValidators: true});
        
            const course = await CourseModel.findOne({id: courseId});
            res.status(200).send(course);           
        }
    }else{
        console.log('Invalid data', error);

        res.status(404).send('Invalid data');
    }
});

async function isValid(courseId, HOD, instructorId, instructorId2) {
    const department = await DepartmentModel.findOne({HOD: HOD});
    let isValidCourse = await CourseModel.findOne({id: courseId, mainDepartment: department.id});
    let isValidACMember = await StaffMemberModel.findOne({id: instructorId, department: department.id});
    if(!instructorId2)
        return isValidACMember && isValidCourse && await StaffMemberModel.findOne({id: instructorId2, department: department.id});
    return isValidACMember && isValidCourse;
}

router.delete('/deleteInstructor', [authentication], async(req, res)=>{
    const schema = Joi.object({
        courseId: Joi.string().min(8).max(16).required(),
        instructorId: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required(),
        member: Joi.object({id: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required()}).required()
    });
    const{error, value}= schema.validate(req.body, {allowUnknown: true});

    if(!error){
        let courseId = value.courseId;
        let instructorId = value.instructorId;
        let HOD = value.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD});
        if(!department)
            return res.send('invalid data')    

        if(!isValid(courseId, HOD, instructorId)){
            console.log('Invalid course or instructor');
            res.status(403).send('Invalid course or instructor');
        }else{
            const course =  await CourseModel.findOneAndUpdate({id: courseId}, {$pull:  {instructors: instructorId}}, {runValidators: true});

            res.status(200).send(await CourseModel.findOne({id: courseId}));   
        
        }
    }else{
        console.log('Invalid data', error);

        res.status(404).send('Invalid data');
    }
});


router.put('/updateInstructor', [authentication],async(req, res)=>{
    const schema = Joi.object({
        courseId: Joi.string().min(8).max(16).required(),
        instructorId1: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required(),
        instructorId2: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required(),
        member: Joi.object({id: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required()}).required()
    });
    const{error, value}= schema.validate(req.body, {allowUnknown: true});
    if(!error){
        let courseId = value.courseId;
        let instructorId1 = value.instructorId1;
        let instructorId2 = value.instructorId2;
        let HOD = value.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD});
        if(!department)
            return res.send('invalid data')    
        if(!isValid(courseId, HOD, instructorId1, instructorId2)){
            console.log('Invalid course or instructor');
            res.status(403).send('Invalid course or instructor');
        }else{
            const course = await CourseModel.updateOne({id: courseId, instructors: instructorId1}, {$set:  {"instructors.$": instructorId2}}, {runValidators: true});
        
            res.status(200).send(await CourseModel.findOne({id: courseId}));       
        }    
    }else{
        console.log('Invalid data', error);

        res.status(404).send('Invalid data');
    }
})

router.get('/viewStaff', [authentication], async(req, res)=>{
    const schema = Joi.object({
        courseId: Joi.string().min(8).max(16),
        member: Joi.object({id: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required()}).required()                
    })
    const {error, value} = schema.validate(req.body, {allowUnknown: true});
    if(!error){
        let courseId = value.courseId;
        let HOD_Id = value.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        if(!department)
            return res.send('invalid data')
        if(!courseId){
            const staffMembers = await StaffMemberModel.find({department: department.id});
            const profiles = [];
            for(member of staffMembers){
                profiles.push(getProfile(member));
            }
            res.send(profiles);
        }else{
            if(!await CourseModel.findOne({id: courseId, mainDepartment: department.id})){
                res.status(403).sender('invalid course');
            }else{
                res.status(200).send(await viewStaff(courseId));        
            }
        }
    
    }else{
        res.status(404).sender('invalid data');
    }
})
function getProfile(member){
    return {id: member.id, name: member.name, email: member.email,
        gender: member.gender, salary: member.salary, officeLoc: member.officeLoc,
         dayOff: member.dayOff, department: member.department};
}
async function viewStaff(courseId){
    const course = await CourseModel.findOne({id: courseId});
    var staff = [];

    for(instructorId of course.instructors){
        const instructor = await StaffMemberModel.findOne({id: instructorId});
        staff.push(getProfile(instructor));
    }


    for(TA_Id of course.TAs){
        const TA = await StaffMemberModel.findOne({id: TA_Id});
        staff.push(getProfile(TA));
    }

    return {'courseId': course.id, 'staff': staff};
};

router.get('/viewDayOff', [authentication], async (req, res)=>{
    const schema = Joi.object({
        staffId: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')),
        member: Joi.object({id: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*')).required()}).required()                
    })

    const{error, value} = schema.validate(req.body, {allowUnknown: true});
    if(!error){
        let staffId = value.staffId;
        let HOD_Id = value.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        if(!department)
            return res.send('invalid data')
        if(!staffId){
            const staffMembers = await StaffMemberModel.find({department: department.id});
    
            let dayOffs = [];
    
            for(staffMember of staffMembers){
                dayOffs.push({name: staffMember.name, id: staffMember.id, dayOff: staffMember.dayOff});
            }
    
            res.status(200).send(dayOffs);
    
        }else{
            try{
                let staffMember = await StaffMemberModel.findOne({id: staffId, department: department.id});
                res.status(200).send({name: staffMember.name, id: staffMember.id, dayOff: staffMember.dayOff});    
            }catch(err){
                res.status(403).send('invalid data');
            }
        }    
    }else{
        res.status(404).send('invalid data');
    }
});

router.get('/viewChangeDayOffRequests', [authentication], async (req, res)=>{
    try{
        let HOD_Id = req.body.member.id;

        let requests = await RequestModel.find({receiver: HOD_Id, type: "DayOff"});
        let results = []
        for(request of requests)
            results.push(request);
        res.status(200).send(results);    
    }catch(err){
        res.status(404).send(err);
    }
});

function getRequest(request){
    return {id: request.id, from: request.sender, status: request.status, content: request.content, slot: request.slot, documents: request.attachmentURL}
}

router.get('/viewLeaveRequests', [authentication], async (req, res)=>{
    try{
        let HOD_Id = req.body.member.id;
        let requests = await RequestModel.find({receiver: HOD_Id, type: /Leave/});
        let results = []
        for(request of requests)
            results.push(request);

        res.status(200).send(results);
    }catch(err){
        res.status(404).send(err);
    }
})


router.post('/request', [authentication], async(req, res)=>{
    try{
        let HOD_Id = req.body.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        if(!department)
            return res.send('invalid data');
                
        let requestId = req.body.requestId;
        let status = req.body.status;
        if(requestId == undefined || status == undefined)
            return res.status(403).send('There is missing data');
        if(status == 'Accepted'){
            let request = await RequestModel.findOneAndUpdate({id: requestId}, {status: status});
            let duration;
            switch(request.type){
                case "DayOff":
                    let newDayOff = request.startDate.getDate()-1;
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {dayOff: newDayOff, $push: {notifications:'Your change-day off request has been accepted'}});
                    break;
                case 'AnnualLeave':
                    duration = request.duration;
                    await StaffMemberModel.findOneAndUpdate({id: request.sender}, 
                        {$inc :{leaves: duration}, $push: {notifications:'Your annual leave request has been accepted'}});
                    break;
                case 'AccidentalLeave':
                    duration = request.duration;
                    await StaffMemberModel.findOneAndUpdate({id: request.sender}, 
                        {$inc :{leaves: duration}, $push: {notifications:'Your accidental leave request has been accepted'}});
                    break;
                case 'SickLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your sick leave request has been accepted'}});
                    break;
                case 'MaternityLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your maternity leave request has been accepted'}});
                    break;
                case 'CompensationLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your Compensation leave request has been accepted'}});
                    break;
                default:
                    return res.status(403).send('invalid data');
            }
            res.status(200).send('Request is accepted successfully');
        }else if(status == 'Rejected'){
            let comment = req.body.comment;
            let request;
            if(comment != undefined){
                request = await RequestModel.findOneAndUpdate({id: requestId}, {status: status, comment: comment});
            }else{
                request = await RequestModel.findOneAndUpdate({id: requestId}, {status: status});
            }
            switch(request.type){
                case "DayOff":       
                    let newDayOff = request.startDate.getDay();
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your change-day off request has been rejected'}});
                    break;
                case 'AnnualLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender}, 
                        {$push: {notifications:'Your annual leave request has been rejected'}});
                    break;
                case 'AccidentalLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender}, 
                        {$push: {notifications:'Your accidental leave request has been rejected'}});
                    break;
                case 'SickLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your sick leave request has been rejected'}});
                    break;
                case 'MaternityLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your maternity leave request has been rejected'}});
                    break;
                case 'CompensationLeave':
                    await StaffMemberModel.findOneAndUpdate({id: request.sender},  
                        {$push: {notifications:'Your Compensation leave request has been rejected'}});
                    break;
                default:
                    return res.status(403).send('invalid data');
            }
            res.status(200).send('Request is Rejected successfully')
        }else{
            res.status(403).send('invalid request status');
        }    
    }catch(error){
        res.status(404).send(error);
    }
})

router.get('/viewCoverage', [authentication], async(req, res)=>{
    let HOD_Id = req.body.member.id;
    const department = await DepartmentModel.findOne({HOD: HOD_Id});
    if(!department)
        return res.send('invalid data')
    const courses = await CourseModel.find({mainDepartment: department.id});
    let coveragerPerCourse = []
    for(course of courses){
        coveragerPerCourse.push(await courseCoverage(course));
    }
    res.send(coveragerPerCourse);
})

async function courseCoverage(course){
    let numAssignedSlots = await SlotModel.countDocuments({course: course.id});
    let coverage = (numAssignedSlots/course.numSlots)*100;
    return {courseId: course.id, name: course.name, coverage: coverage};
}

router.get('/viewTeachingAssignments/:courseId',[authentication] ,async (req, res)=>{
    try{
        let HOD_Id = req.body.member.id;
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        if(!department)
            return res.status(404).send('invalid data')
        let course = req.params.courseId;
        if(await CourseModel.findOne({id: course, mainDepartment: department.id})){
            let slots = await SlotModel.find({course: course});
            let teachingAssignments = [];
            for(slot of slots){
                let member = await StaffMemberModel.findOne({id: slot.instructor});
                teachingAssignments.push(teachindAssignment(slot, member));
            }
            res.status(200).send(teachingAssignments);        
        }else{
            res.status(404).send('invalid course');
        }
    }catch(error){
        res.status(404).send(error);
    }
})

function teachindAssignment(slot, member) {
    return {staffId: member.id, name: member.name, course: slot.course, period: slot.period, day: slot.day, location: slot.location};
}
module.exports = router;