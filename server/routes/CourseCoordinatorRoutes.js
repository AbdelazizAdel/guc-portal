const express = require('express');
const Request = require('../models/Request.js');
const StaffMember = require('../models/StaffMember.js');
const Slot = require('../models/Slot.js');
const Course = require('../models/Course.js');
const {authentication} = require('./middleware');
const router = express.Router();
router.use(express.json());
router.post('/request',async(req,res)=>{
    const request = new Request(
        {
            sender:req.body.sender,
            receiver:req.body.receiver,
            status:'Pending',
            content:req.body.content,
            submissionDate:Date.now(),
            type:'SlotLinking',
            slot:req.body.slot
        }
    );
    await request.save();;
    res.status(200).send('The request has bben saved');

})
router.get('/coordinator/courses',[authentication],async(req,res)=>{
    const coordinatorId = req.body.member.id;
    const coordinator =req.body.member;
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
router.get('/coordinator/courses/:courseId/slot-linking-requests',[authentication],async(req,res)=>{
    const coordinatorId = req.body.member.id;
    const courseId = req.params.courseId;
    const coordinator = req.body.member;
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
    const requests = await Request.find({'status':'Pending',type:'SlotLinking'}).or(cond);
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
            slotRequest.requestId = requests[j].id;
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

router.patch('/coordinator/courses/:courseId',[authentication],async (req,res)=>{
    const coordinatorId = req.body.member.id;
    const courseId = req.params.courseId;
    const requestId = req.body.requestId;
    const requestResponse = req.body.requestResponse;
    const coordinator = req.body.member;
    if(coordinator == null){
        return res.status(404).send('Member not found!!');
    }
    const course = await Course.findOne({'id':`${courseId}`});
    if(course == null){
        return res.status(404).send('Course not found!!');
    }
    if(course.coordinator != coordinatorId){
        return res.status(401).send('You don\'t have access to view or modify this information!!');
    }
    const request = await Request.findOne({'id':`${requestId}`});
    
    if(request == null){
        return res.status(404).send('Request not found!!');
    }
    if(request.status !== 'Pending'){
        return res.status(400).send('You can\'t modify this request!!');
    }
    if(request.type !== 'SlotLinking'){
        return res.status(400).send('The request provided is not slot linking');
    }
    const slot = await Slot.findOne({'id':`${request.slot}`});
    if(slot.course != courseId){
        return res.status(400).send('Bad request! the slot provided in the request doesn\'t match the course ');
    }
    if(requestResponse == 'Accepted'){
        const query1 = Request.updateOne({'id':`${requestId}`},{'status':'Accepted'});
        const query2 = Slot.updateOne({'id':`${request.slot}`},{'instructor': `${request.sender}`});
        Promise.allSettled([query1,query2]).then((result)=>{
            return res.status(200).send('Request has been successfully accepted!!');
        })
    }
    else{
        await  Request.updateOne({'id':`${requestId}`},{'status':'Rejected'});
        return res.status(200).send('Request has been successfully rejected!!');
    }
})
module.exports = router;