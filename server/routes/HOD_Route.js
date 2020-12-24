const express= require('express');
const router= express.Router();
const Joi = require('joi');

const StaffMemberModel = require('../models/StaffMember');
const CourseModel = require('../models/Course');
const DepartmentModel = require('../models/Department');
const RequestModel = require('../models/Request');
const SlotModel = require('../models/Slot');
const {authentication} = require('./middleware');

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

router.route('/viewChangeDayOffRequests').get(async (req, res)=>{
    let HOD_Id = req.body.id;

    let requests = await RequestModel.find({receiver: HOD_Id, type: "ChangeDayOffRequest"});
    let results = []
    for(request of requests)
        results.push(getRequest(request));
    res.send(results);
});

function getRequest(request){
    return {from: request.sender, status: request.status, content: request.content, slot: request.slot, documents: request.attachmentURL}
}

router.route('/viewLeaveRequests').get(async (req, res)=>{
    let HOD_Id = req.body.id;

    let requests = await RequestModel.find({receiver: HOD_Id, type: "LeaveRequest"});
    let results = []
    for(request of requests)
        results.push(getRequest(request));

    res.send(results);
})


router.route('/request:id').post(async(req, res)=>{
    let requestId = req.params.id;
    let status = req.body.status;
    if(status == 'Accepted'){
        let request = await RequestModel.findOneAndUpdate({id: requestId}, {status: status});
        if(request.type == "ChangeDayOffRequest"){
            let newDayOff = request.startDate.getDay();
            await StaffMemberModel.findOneAndUpdate({id: request.sender}, {dayOff: newDayOff});
            res.status(200).send('day off has been changed successfully')
        }else{
            
        }
    }else{
        let comment = req.body.comment;
        if(comment != undefined){
            await RequestModel.findOneAndUpdate({id: requestId}, {status: status, comment: comment});
        }
    }
})

router.route('/viewCoverage').get(async(req, res)=>{
    let HOD_Id = req.body.id;
    const department = await DepartmentModel.findOne({HOD: HOD_Id});
    const courses = await CourseModel.find({department: department});
    let coveragerPerCourse = []
    for(course of courses){
        coveragerPerCourse.push(await courseCoverage(course));
    }

    res.send(coveragerPerCourse);
})

async function courseCoverage(course){
    let numAssignedSlots = await SlotModel.countDocuments({course: course});
    let coverage = numAssignedSlots/course.numSlots;
    return {courseId: course.id, name: course.name, coverage: coverage};
}

router.route('/viewTeachingAssignments').get(async (req, res)=>{
    let HOD_Id = req.body.id;
    let course = req.body.courseId;

    let slots = await SlotModel.find({course: course});
    let teachingAssignments = [];
    for(slot of slots){
        let member = await StaffMemberModel.findOne({id: slot.instructor});
        slot.instructor = getProfile(member);
        teachingAssignments.push(slot);
    }
    res.send(teachingAssignments);
})
module.exports = router;