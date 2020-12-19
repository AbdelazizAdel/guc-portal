const express= require('express');
const router= express.Router();

const StaffMemberModel = require('../models/StaffMember');
const CourseModel = require('../models/Course');
const DepartmentModel = require('../models/Department');
const RequestModel = require('../models/Request');
const SlotModel = require('../models/Slot');

router.route('/assignInstructor').post(async(req, res)=>{
    let courseId = req.body.courseId;
    let instructorId = req.body.instructorId;

    const course =  await CourseModel.findOneAndUpdate({id: courseId}, {$addToSet: {instructors: instructorId}}, {runValidators: true});
    
    res.send(await CourseModel.findOne({id: courseId}));   
});


router.route('/deleteInstructor').delete(async(req, res)=>{
    let courseId = req.body.courseId;
    let instructorId = req.body.instructorId;

    const course =  await CourseModel.findOneAndUpdate({id: courseId}, {$pull:  {instructors: instructorId}}, {runValidators: true});

    res.send(await CourseModel.findOne({id: courseId}));   
});


router.route('/viewStaff').get(async(req, res)=>{
    let courseId = req.body.courseId;
    let HOD_Id = req.body.id;
    if(!courseId){
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        let staff = [];

        for(course of department.courses){
            staff.push(await viewStaff(course));
        }
        
        res.send(staff);
    }else{
        res.send(await viewStaff(courseId));        
    }
})

async function viewStaff(courseId){
    const course = await CourseModel.findOne({id: courseId});
    var staff = [];

    for(instructorId of course.instructors){
        const instructor = await StaffMemberModel.findOne({id: instructorId});
        staff.push(instructor);
    }


    for(TA_Id of course.TAs){
        const TA = await StaffMemberModel.findOne({id: TA_Id});
        staff.push(TA);
    }

    return {'courseId': course.id, 'staff': staff};
};

router.route('/viewDayOff').get(async (req, res)=>{
    let staffId = req.body.staffId;
    let HOD_Id = req.body.id;
    if(!staffId){
        const department = await DepartmentModel.findOne({HOD: HOD_Id});
        let dayOffs = [];

        for(course of department.courses){
            let staffMember = (await viewStaff(course)).staff;
            dayOffs.push({name: staffMember.name, id: staffMember.id, dayOff: staffMember.dayOff});
        }

        res.send(dayOffs);

    }else{
        let staffMember = await StaffMemberModel.find({id: staffId});
        res.send({name: staffMember.name, id: staffMember.id, dayOff: staffMember.dayOff});
    }


});

router.route('/viewChangeDayOffRequests').get(async (req, res)=>{
    let HOD_Id = req.body.id;

    let requests = await RequestModel.find({receiver: HOD_Id, type: "ChangeDayOffRequest"});

    res.send(requests);
});


router.route('/viewLeaveRequests').get(async (req, res)=>{
    let HOD_Id = req.body.id;

    let requests = await RequestModel.find({receiver: HOD_Id, type: "LeaveRequest"});

    res.send(requests);
})


router.route('/viewTeachingAssignments').get(async (req, res)=>{
    let HOD_Id = req.body.id;
    const department = await DepartmentModel.findOne({HOD: HOD_Id});

    let Slots = [];
    for(course of department.courses){
        let slot = await SlotModel.find({course: course});
        Slots.push(slot);
    }

    res.send(Slots);
})
module.exports = router;