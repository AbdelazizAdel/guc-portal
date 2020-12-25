const express = require('express');
const router = express.Router();
const Department = require('../models/Department.js');
const Member = require('../models/StaffMember.js');
const Request = require('../models/Request.js');
const Slot = require('../models/Slot.js');
const Course = require('../models/Course.js');
const Faculty = require('../models/Faculty.js');
const Replacement = require('../models/ReplacementSlot.js');
const Authentication = require('./middleware.js').authentication;
const MetaData = require('../models/metaData.js');

router.use(express.json());

router.get('/schedule', async (req, res)=>{

    try{

        let staffId = req.body.id;

        let schedule = [];

        let scheule = await Slot.find({'instructor':`${staffId}`});

        let replacements = await Replacement.find({'instructor' : `${staffId}`});
        replacements = replacements.filter((replacement) => {
            let dateToUse =  new Date();
            let lastSaturday = new Date().setDate(dateToUse.getDate() - ((dateToUse.getDay() + 1) % 7));
            let nextFriday = new Date().setDate(lastSaturday.getDate() + 6);
            return replacement.date >= lastSaturday && replacement.date <= nextFriday;
        });
        let date = new Date();
        date.getMonth();
        
        scheule = schedule.concat(replacements);
        response = {'schedule' : schedule};
        res.status(200).send(response);
    }
    catch(err){
            console.log(err);
            res.status(404).send('fe blabizo 7asal hena');
    }
});

router.post('/replacement/request', async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`})[0].lastId;
        let courseId = req.body.courseId;
        let sender = req.body.id;
        receiver = req.body.receiver;
        if(courseId === undefined){
            res.status(404).send('Please choose a course');
        }
        let senderCourse = await Course.find({'id': courseId})[0].TAs.filter((TA) => {
            return TA === sender || TA === receiver;
        });
        if(senderCourse.length !== 2){
            return res.status(404).send('Please choose a TA from the same course');
        }
        if(receiver === undefined || sender === receiver){
            return res.status(404).send('Please choose another TA to replace with');
        }
        const startDate = req.body.startDate;
        const slot = req.body.slot;
        let submissionDate = new Date();
        if(startDate === undefined || submissionDate > startDate){
            return res.status(404).send('Please choose a valid date');
        }
        let request = new Request({
            id: requestId,
            sender: req.body.id,
            receiver: receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'replacement',
            submissionDate: submissionDate,
            startDate: startDate,
            duration: req.body.duration,
            slot: slot,
            attachmentURL : req.body.attachmentURL
        });
        request.save();
        res.status(200).send('Replacement request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.post('/slotlinking/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`})[0].lastId;
        let courseId = req.body.courseId;
        let sender = req.body.id;
        if(courseId === undefined){
            res.status(404).send('Please choose a course');
        }

        let course = await Course.find({'id': courseId})[0];

        let senderCourse = course.TAs.filter((TA) => {
            return TA === sender;
        });
        if(senderCourse.length < 1){
            return res.status(404).send('Please choose a valid course');
        }

        receiver = course.coordinator;

        let submissionDate = new Date();

        let request = new Request({
            id: requestId,
            sender: sender,
            receiver: receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'slot linking',
            submissionDate: submissionDate,
            startDate: req.body.startDate,
            duration: req.body.duration,
            slot: req.body.slot,
            attachmentURL : req.body.attachmentURL
        });
        request.save();
        res.status(200).send('Slot linking request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.post('/changedayoff/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`})[0].lastId;
        let senderId = req.body.id;
        let dayOff = req.body.dayOff;

        if(dayOff === undefined || dayOff < 1 || dayOff > 7){
            res.status(404).send('Please enter a valid week day number');
        }

        let sender = await Member.find({'id' : senderId})[0];

        let department = await Department.find({'id' : sender.department})[0];
        
        let receiver = department.HOD;

        let submissionDate = new Date();
        let startDate = new Date().setDate(dayOff);

        let request = new Request({
            id: requestId,
            sender: senderId,
            receiver: receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'change day off',
            submissionDate: submissionDate,
            startDate: startDate,
            duration: req.body.duration,
            slot: req.body.slot,
            attachmentURL : req.body.attachmentURL
        });
        request.save();
        res.status(200).send('Change day off request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.post('/leave/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`})[0].lastId;
        let senderId = req.body.id;
        let duration = req.body.duration;
        let startDate = req.body.startDate;
        let dayOff = req.body.dayOff;
        let content = req.body.content;
        let leaveType = req.body.leaveType;

        let submissionDate = new Date();

        if(startDate === undefined){
            res.status(404).send('enter start date');
        }

        if(leaveType === undefined){
            res.status(404).send('Enter leave type');
        }

        if((leaveType === 'AccidentalLeave' || leaveType === 'AnnualLeave' || leaveType === 'MaternityLeave' || leaveType === 'SickLeave') && duration === undefined){
            res.status(404).send('Enter duration');
        }

        if(leaveType === 'AnnualLeave' && startDate < submissionDate){
            res.status(404).send('Please enter a valid start date');
        }

        if((leaveType === 'SickLeave' || leaveType === 'MaternityLeave') && content === undefined){
            res.status(404).send("Provide the proper documents");
        }

        let sender = await Member.find({'id' : senderId})[0];
        
        let department = await Department.find({'id' : sender.department})[0];
        let receiver = department.HOD;

        let startDay = sender.startDay;
        let leaves = sender.leaves;

        var months;
        months = (submissionDate.getFullYear() - startDay.getFullYear()) * 12;
        months = month - startDay.getMonth() + 1;
        months += submissionDate.getMonth();
        if(startDate.getDate() >= 11){
            month -= 1;
        }

        let remainingLeaves = months * 2.5 - leaves;

        if(leaveType === 'AccidentalLeave' && duration > 6){
            res.status(404).send('You have up to 6 days');
        }

        if(leaveType === 'MaternityLeave' && sender.gender !== 'female'){
            res.status(404).send('You should be a woman :)');
        }

        if((leaveType === 'AccidentalLeave' || leaveType === 'AnnualLeave')){
            if(duration > remainingLeaves){
                res.status(404).send("You don't have these available leave days");
            }
            else{
                const updateResponnse = await Member.updateOne({'id' : senderId}, {'leaves' : (sender.leaves + duration)}); //not sure
            }
        }

        if(leaveType === 'CompensationLeave' && (dayOff.getFullYear != submissionDate.getFullYear() || startDate.getFullYear() != submissionDate.getFullYear() 
        || dayOff.getMonth() != submissionDate.getMonth() || startDate.getMonth() != submissionDate.getMonth())){
            res.status(404).send('enter valid dates');
        }

        if(leaveType === 'SickLeave' && Math.ceil((second-first)/(1000*60*60*24)) > 3){
            res.status(404).send('You can submit leave request by maximum 3 days');
        }
        


        let request = new Request({
            id: requestId,
            sender: senderId,
            receiver: receiver,
            status: 'Pending',
            content: content,
            comment: req.body.comment,
            type: leaveType,
            submissionDate: submissionDate,
            startDate: startDate,
            dayOff : dayOff,
            duration: duration,
            slot: req.body.slot,
            attachmentURL : req.body.attachmentURL
        });
        request.save();
        res.status(200).send('Change day off request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.delete('/request/:requestID', [Authentication], async(req, res) => {
    const id = req.body.id;
    const request = await Request.findOne({id : req.params.requestID});
    if(request == null)
        return res.send('There is no request with such id');
    if(request.status == 'Pending') {
        await Request.deleteOne({id : req.params.requestID});
        return res.send('request cancelled');
    }
    if(request.status == 'Accepted' && request.type != 'SlotLinking' && request.type != 'DayOff' &&
        request.startDate.getTime() > new Date().getTime()) {
        if(request.type == 'SickLeave' || request.type == 'MaternityLeave') {
            await Request.deleteOne({id : req.params.requestID});
            return res.send('request cancelled');
        }
        if(request.type == 'AccidentalLeave' || request.type == 'AnnualLeave') {
            const duration = request.duration == undefined ? 1 : request.duration;
            await Member.updateOne({id}, {leaves : req.body.member.leaves - duration});
            await Request.deleteOne({id : req.params.requestID});
            return res.send('request cancelled');
        }
        if(request.type == 'ReplacementSlot') {
            const slot = await Slot.findOne({id : request.slot});
            if(slot == null)
                return res.send('error happened during cancelation');
            const replacement = await Replacement.findOne({
                day : slot.day,
                period : slot.period,
                location : slot.location,
                date : request.startDate
            });
            if(replacement == null)
                return res.send('error happened during cancelation');
            await Replacement.deleteOne({id : replacement.id});
            await Request.deleteOne({id : req.params.requestID});
            return res.send('request cancelled');
        }
    }
    else
        res.send('This request cannot be cancelled');
});


router.get('/submittedRequests', [Authentication], async(req, res) => {
    const {id} = req.body.member;
    if(req.body.status == undefined) {
        const requests = await Request.find().or([{sender : id}, {receiver : id}]);
        return res.send(requests);
    }
    const requests = await Request.find({status : req.body.status}).or([{sender : id}, {receiver : id}]);
    return res.send(requests);
})


module.exports = router;