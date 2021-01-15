const express = require('express');
const Request = require('../models/Request.js');
const StaffMember = require('../models/StaffMember.js');
const Slot = require('../models/Slot.js');
const Course = require('../models/Course.js');
const Location = require('../models/Location');
const MetaData = require('../models/metaData.js');
const {authentication} = require('./middleware');
const { app } = require('../app.js');
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
        return res.status(200).send({slotRequests:[]});
    }
    let cond = [];
    for(let i = 0;i < slots.length;i++){
    cond.push({'slot':`${slots[i].id}`});
    }
    const requests = await Request.find({'status':'Pending',type:'SlotLinking'}).or(cond);
  //  console.log('requests',requests);
    let queries = [];
    for(let i = 0;i < requests.length;i++){
        queries.push(StaffMember.findOne({'id':`${requests[i].sender}`}));
        queries.push(Slot.findOne({'id':`${requests[i].slot}`}));
    }
   // console.log('queries',queries);
    Promise.allSettled(queries).then((result)=>{
        output = [];
        for(let i = 0,j = 0;i < result.length;i+=2,j++){
            let slotRequest ={};
            slotRequest.requestId = requests[j].id;
            slotRequest.status=requests[j].status;
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
           // console.log(slotRequest);
        }
       // console.log(output);
        return res.status(200).send({slotRequests:output});
    });


});
router.get('/coordinator/courses/:courseId/non-pending-slot-linking-requests',[authentication],async(req,res)=>{
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
    const slots = await Slot.find({'course':`${courseId}`});
    console.log('This is slots',slots);
    if(slots.length == 0){
        return res.send({slotRequests:[]});
    }
    let cond = [];
    for(let i = 0;i < slots.length;i++){
    cond.push({'slot':`${slots[i].id}`});
    }
    const requests = await Request.find({'status':{'$ne':'Pending'},type:'SlotLinking'}).or(cond);
    console.log(requests);
    //console.log(requests);
    let queries = [];
    for(let i = 0;i < requests.length;i++){
        queries.push(StaffMember.findOne({'id':`${requests[i].sender}`}));
        queries.push(Slot.findOne({'id':`${requests[i].slot}`}));
    }
    //console.log(queries);
    Promise.allSettled(queries).then((result)=>{
        output = [];
        console.log(result.length);
        for(let i = 0,j = 0;i < result.length;i+=2,j++){
            let slotRequest ={};
            slotRequest.requestId = requests[j].id;
            slotRequest.memberId = result[i].value.id;
            slotRequest.status = requests[j].status;
            slotRequest.comment = requests[j].comment;
            slotRequest.memberName = result[i].value.name;
            slotRequest.slotId = result[i+1].value.id;
            slotRequest.slotDay = result[i+1].value.day;
            slotRequest.slotPeriod = result[i+1].value.period;
            slotRequest.slotLocation = result[i+1].value.location;
            slotRequest.slotType = result[i+1].value.slotType;
            slotRequest.content = requests[j].content;
            slotRequest.comment = requests[j].comment;
            slotRequest.submissionDate = requests[j].submissionDate;
            output.push(slotRequest);
          //  console.log(slotRequest);
        }
        return res.status(200).send({slotRequests:output});
    });


});

router.patch('/coordinator/courses/:courseId',[authentication],async (req,res)=>{
    const coordinatorId = req.body.member.id;
    const courseId = req.params.courseId;
    const requestId = req.body.requestId;
    const comment = req.body.comment;
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
        const query1 = Request.updateOne({'id':`${requestId}`},{'status':'Accepted','comment':comment});
        const query2 = Slot.updateOne({'id':`${request.slot}`},{'instructor': `${request.sender}`});
        Promise.allSettled([query1,query2]).then((result)=>{
            return res.status(200).send('Request has been successfully accepted!!');
        })
    }
    else{
        await  Request.updateOne({'id':`${requestId}`},{'status':'Rejected','comment':comment});
        return res.status(200).send('Request has been successfully rejected!!');
    }
});

router.post('/slot/add', [authentication], async (req,res)=>{
    try {
        let slotId = await MetaData.findOne({'sequenceName':`slot`});
        if(slotId === null){
            slotId = 1;
        }
        else{
            slotId = slotId.lastId;

        }
        const id =slotId;
        slotId=`slot${slotId}`;
        const slotAtTheSameTime = await Slot.find({day:req.body.day,period:req.body.period,location:req.body.location});
        if(slotAtTheSameTime.length!==0){
            console.log('there is  a slot at the same time');
            return res.status(403).send('There is an activity at this location at that time');
        }
        const locationexists = await Location.find({'name':req.body.location});
        if(locationexists.length===0){
            console.log('no such location');
            return res.status(403).send('No such location exists');
        }
        let sender = req.body.member.id;
        let courseId = req.body.course;
        if(courseId === undefined){
            res.status(404).send('enter course id'); 
        }
        let course = await Course.find({'id': courseId});
        course = course[0];

        if(sender !== course.coordinator){
            res.status(401).send('Unauthorized');
        }

        
        const response = await Course.updateOne({'id' : courseId}, {'numSlots' : course.numSlots + 1}); //not sure
        
        slot = new Slot({
            'id': slotId,
            'day': req.body.day,
            'period': req.body.period,
            'location': req.body.location,
            'slotType': req.body.slotType,
            'course': courseId,
        });
        await slot.save();
        if(id!==1){
        await MetaData.updateOne({'sequenceName' : 'slot'}, {'lastId' : id+1});
        }
        else{
            const slotMeta = new MetaData({sequenceName:'slot',lastId:2});
            await slotMeta.save();
        }
        res.status(200).send('slot added successfully');
    }
    catch(err){
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});
router.get('/isCoordinator/:courseId',[authentication],async(req,res)=>{
    const courseId = req.params.courseId;    
    const course = await Course.findOne({'id':courseId});
    if(course!==null&&req.body.member.id===course.coordinator){
        res.status(200).send({isCoordinator:true});
    }
    else{

        res.status(200).send({isCoordinator:false});
    }
})

router.delete('/courses/:courseId/slot/delete', [authentication], async (req,res)=>{
    try {
        let slotId = req.body.slot;
        let courseId = req.params.courseId;
        let sender = req.body.member.id;

        if(slotId === undefined){
            res.status(404).send('enter slot id'); 
        }

        let slot = await Slot.findOne({'id' : slotId,'course':courseId});
        if(slot === null){
            return res.status(403).send('no such slot exists');
        }
        const course = await Course.findOne({'id':courseId});
        if(sender !== course.coordinator){
            res.status(404).send('Unauthorized');
        }
        
        const updateResponnse = await Course.updateOne({'id' : courseId}, {'numSlots' : course.numSlots - 1}); //not sure
        const deleteResponse = await Slot.deleteOne({'id' : slotId});

        res.status(200).send('slot deleted successfully');
    }
    catch(err){
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});
router.get('/courses/:courseId/all-slots',[authentication],async(req,res)=>{
    const courseId = req.params.courseId;
    const course = await Course.findOne({'id':courseId});
    const member = req.body.member;
    if(course === undefined){
        return res.status(403).send('No such course exists');
    }
    if(course.coordinator!==member.id){
        return res.status(403).send('Unauthorized');
    }
    const slots = await Slot.find({'course':courseId});
    const allSlots = [];
    for(let i = 0;i<slots.length;i++){
        allSlots.push(slots[i].id);
    }
    return res.status(200).send({slots:allSlots});
})
router.get('/courses/:courseId/slot-info/:slotId',[authentication],async(req,res)=>{
    const courseId = req.params.courseId;
    const slotId = req.params.slotId;
    const course = await Course.findOne({'id':courseId});
    if(course === undefined){
        return res.status(403).send('No such course exists');
    }
    const member = req.body.member;
    if(course.coordinator!==member.id){
        return res.status(403).send('Unauthorized');
    }
    const slot = await Slot.findOne({'course':courseId,'id':slotId});
    if(slot===undefined)
        return res.status(403).send('No such slot exists');

    return res.status(200).send({slotInfo:{slotId:slotId,day:slot.day,period:slot.period,location:slot.location,slotType:slot.slotType}});
})
router.post('/courses/:courseId/slot/update', [authentication], async (req, res) => {
        console.log('i entered');
        let slotId = req.body.slot;
        let sender = req.body.member.id;
        const courseId = req.params.courseId;
        if(slotId === undefined){
            console.log('hi');
            res.status(403).send('enter slot id');
        }
        let course = await Course.findOne({'id': courseId});
        if(course===null){
            console.log('no such course');
            return res.status(403).send('No such course exists');
        }
        const locationexists = await Location.find({'name':req.body.location});
        if(locationexists.length===0){
            console.log('no such location');
            return res.status(403).send('No such location exists');
        }

        if(sender !== course.coordinator){
            console.log('you are not a coordinator');
            res.status(403).send('Unauthorized');
        }
        const slot = await Slot.findOne({'course':courseId,'id':slotId});
        if(slot===undefined){
            console.log('not same course');
            return res.status(403).send('No such slot exists');
        }
        const updateResponnse = await Slot.updateOne({'id' : slotId}, {
            'day': req.body.day,
            'period': req.body.period,
            'location': req.body.location,
            'slotType': req.body.slotType,
        });

        res.status(200).send('slot updated successfully');
    }    
);


module.exports = router;