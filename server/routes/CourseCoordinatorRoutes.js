const express = require('express');
const Request = require('../models/Request.js');
const StaffMember = require('../models/StaffMember.js');
const Slot = require('../models/Slot.js');
const Course = require('../models/Course.js');
const router = express.Router();
router.use(express.json());
router.post('/request',async(req,res)=>{
    const request = new Request(
        {
            sender:req.body.sender,
            receiver:req.body.receiver,
            status:'pending',
            content:req.body.content,
            submissionDate:Date.now(),
            type:'slot linking',
            slot:req.body.slot
        }
    );
    await request.save();;
    res.status(200).send('The request has bben saved');

})
router.get('/coordinator/:coordinatorId/courses',async(req,res)=>{
    const coordinatorId = req.params.coordinatorId;
    const coordinator = await StaffMember.findOne({'id':`${coordinatorId}`});
    if(coordinator == null){
        return res.status(404).send('This member is not found!!');
    }
    const courses = await Course.find({'coordinator':`${coordinatorId}`});
    if(courses.length === 0){
        return res.status(403).send('you are not allowed to view this information!!');
    }
    let response = {}; 
    let output = [];
    for(let i = 0; i < courses.length;i++){
        output.push({courseId:courses[i].id,courseName:courses[i].name});
    }
    response.courses = output;
    res.status(200).send(response);

})
router.get('/coordinator/:coordinatorId/courses/:courseId/slot-linking-requests',async(req,res)=>{
    const coordinatorId = req.params.coordinatorId;
    const courseId = req.params.courseId;
    const coordinator = await StaffMember.findOne({'id':`${coordinatorId}`});
    if(coordinator == null){
        return res.status(404).send('The member you are trying to access is not found!!');
    }
    const course = await Course.findOne({'id':courseId});
    if(course.coordinator !==coordinatorId){
        return res.status(403).send('You don\'t have access to this information');
    }
    const slots = await Slot.find({'course':`${courseId}`}).or([{'instructor':{'$exists':false}},{'instructor':null}]);
    if(slots.length == 0){
        return res.status(403).send('All slots are assigned to instructors!!');
    }
    let cond = [];
    for(let i = 0;i < slots.length;i++){
    cond.push({'slot':`${slots[i].id}`});
    }
    const requests = await Request.find({'status':'pending',type:'slot linking'}).or(cond);
    console.log(requests);
    let queries = [];
    for(let i = 0;i < requests.length;i++){
        queries.push(StaffMember.findOne({'id':`${requests[i].sender}`}));
        queries.push(Slot.findOne({'id':`${requests[i].slot}`}));
    }
    console.log(queries);
    Promise.allSettled(queries).then((result)=>{
        output = [];
        console.log(result.length);
        for(let i = 0,j = 0;i < result.length;i+=2,j++){
            let slotRequest ={};
            slotRequest.memberId = result[i].value.id;
            slotRequest.memberName = result[i].value.name;
            slotRequest.slotId = result[i+1].value.id;
            slotRequest.slotDay = result[i+1].value.day;
            slotRequest.slotPeriod = result[i+1].value.period;
            slotRequest.slotLocation = result[i+1].value.location;
            slotRequest.slotType = result[i+1].value.slotType;
            slotRequest.content = requests[j].content;
            slotRequest.submissionDate = requests[j].submissionDate;
            output.push(slotRequest);
            console.log(slotRequest);
        }
        return res.status(200).send({slotRequests:output});
    });


});

module.exports = router;