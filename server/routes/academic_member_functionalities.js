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
const { request } = require('express');

router.use(express.json());

router.get('/schedule', [Authentication], async (req, res)=>{

    try{

        let staffId = req.body.member.id;

        let schedule = [];

        schedule = await Slot.find({'instructor':`${staffId}`});

        let replacements = await Replacement.find({'instructor' : `${staffId}`});
        replacements = replacements.filter((replacement) => {
            let dateToUse =  new Date();
            let lastSaturday = new Date().setDate(dateToUse.getDate() - ((dateToUse.getDay() + 1) % 7));
            let nextFriday = new Date().setDate(lastSaturday.getDate() + 6);
            return replacement.date >= lastSaturday && replacement.date <= nextFriday;
        });
        let date = new Date();
        date.getMonth();
        
        console.log(schedule);

        schedule = schedule.concat(replacements);
        response = {'schedule' : schedule};
        res.status(200).send(response);
    }
    catch(err){
            console.log(err);
            res.status(404).send('fe blabizo 7asal hena');
    }
});

router.post('/replacement/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`});
        console.log(requestId);
        requestId = requestId[0].lastId;
        if(requestId === undefined){
            requestId = 1;
        }
        // requestId++;
        await MetaData.updateOne({'sequenceName' : 'request'}, {'lastId' : requestId + 1});
        let courseId = req.body.courseId;
        let sender = req.body.member.id;
        receiver = req.body.receiver;
        console.log(courseId + " " + sender + " " + receiver);
        if(courseId === undefined){
            res.status(404).send('Please choose a course');
        }
        let senderCourse = await Course.find({'id': courseId});
        if(senderCourse.length === 0){
            res.status(404).send('Please choose a course');
        }
        senderCourse = senderCourse[0].TAs.filter((TA) => {
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
            sender: sender,
            receiver: receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'ReplacementSlot',
            submissionDate: submissionDate,
            startDate: startDate,
            duration: req.body.duration,
            slot: slot,
            attachmentURL : req.body.attachmentURL
        });
        await request.save();
        res.status(200).send('Replacement request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.post('/slotlinking/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`});
        requestId = requestId[0].lastId;
        if(requestId === undefined){
            requestId = 1;
        }
        // requestId++;
        await MetaData.updateOne({'sequenceName' : 'request'}, {'lastId' : requestId + 1});
        let courseId = req.body.courseId;
        let sender = req.body.member.id;
        if(courseId === undefined){
            res.status(404).send('Please choose a course');
        }

        let course = await Course.find({'id': courseId});
        course = course[0];

        let senderCourse = course.TAs.filter((TA) => {
            return TA === sender;
        });
        let check = senderCourse.length > 0;
        senderCourse = course.TAs.filter((TA) => {
            return TA === sender;
        });
        check = check | senderCourse.length > 0;
        if(!check){
            return res.status(404).send('Please choose a valid course');
        }

        receiver = course.coordinator;
        let startDate = new Date(req.body.startDate);
        let submissionDate = new Date();

        let request = new Request({
            id: requestId,
            sender: sender,
            receiver: receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'SlotLinking',
            submissionDate: submissionDate,
            startDate: startDate,
            duration: req.body.duration,
            slot: req.body.slot,
            attachmentURL : req.body.attachmentURL
        });
        await request.save();
        res.status(200).send('Slot linking request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.delete('/request/:requestID', [Authentication], async(req, res) => {
    const id = req.body.member.id;
    const request = await Request.findOne({id : req.params.requestID});
    // console.log(request)
    if(request == null)
        return res.send('There is no request with such id');
    if(request.status == 'Pending') {
        await Request.deleteOne({id : req.params.requestID});
        return res.send('request cancelled');
    }
    if(request.status == 'Accepted' && request.type != 'SlotLinking' && request.type != 'ChangeDayOff' &&
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

router.post('/submittedRequests', [Authentication], async(req, res) => {

    const id = req.body.member.id;
    if(req.body.status == undefined) {
        const requests = await Request.find().or([{sender : id}, {receiver : id}]);
        response = {'requests' : requests};
        console.log(response)
        return res.send(response);
    }
    const requests = await Request.find({status : req.body.status}).or([{sender : id}, {receiver : id}]);
    console.log(requests)
    response = {'requests' : requests};
    return res.send(response);
})


router.post('/changedayoff/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`});
        requestId = requestId[0].lastId;
        if(requestId === undefined){
            requestId = 1;
        }
        // requestId++;
        await MetaData.updateOne({'sequenceName' : 'request'}, {'lastId' : requestId + 1});
        let senderId = req.body.member.id;
        // console.log(req.body.dayOff.getDate() + 'hereeeeeeeeeeeeeeee');
        let dayOff = new Date(req.body.dayOff).getDate();

        if(dayOff === undefined || dayOff < 1 || dayOff > 7){
            res.status(404).send('Please enter a valid week day number');
        }

        let sender = await Member.find({'id' : senderId});
        sender = sender[0];

        let department = await Department.find({'id' : sender.department});
        department = department[0];
        
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
            type: 'ChangeDayOff',
            submissionDate: submissionDate,
            startDate: startDate,
            duration: req.body.duration,
            slot: req.body.slot,
            attachmentURL : req.body.attachmentURL
        });
        await request.save();
        res.status(200).send('Change day off request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

router.post('/leave/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`});
        requestId = requestId[0].lastId;
        if(requestId === undefined){
            requestId = 1;
        }
        // requestId++;
        await MetaData.updateOne({'sequenceName' : 'request'}, {'lastId' : requestId + 1});
        let senderId = req.body.member.id;
        let duration = req.body.duration;
        let startDate = new Date(req.body.startDate);
        let dayOff = new Date(req.body.dayOff === undefined ? new Date() : req.body.dayOff);
        let content = req.body.content;
        let leaveType = req.body.leaveType;
        let attachmentUrl = req.body.attachmentURL;

        let submissionDate = new Date();


        if(startDate === undefined){
            res.status(404).send('enter start date');
            return;
        }

        if(leaveType === undefined){
            res.status(404).send('Enter leave type');

            return;
        }

        if((leaveType === 'AccidentalLeave' || leaveType === 'AnnualLeave' || leaveType === 'MaternityLeave' || leaveType === 'SickLeave') && duration === undefined){
            res.status(404).send('Enter duration');

            return;
        }

        if(leaveType === 'AnnualLeave' && startDate < submissionDate){
            res.status(404).send('Please enter a valid start date');

            return;
        }

        if((leaveType === 'SickLeave' || leaveType === 'MaternityLeave') && attachmentUrl === undefined){
            res.status(404).send("Provide the proper documents");
            return;
        }



        let sender = await Member.find({'id' : senderId});
        sender = sender[0];
        
        let department = await Department.find({'id' : sender.department});
        department = department[0];
        let receiver = department.HOD;

        let startDay = sender.startDay;
        let leaves = sender.leaves;
        // console.log(sender.id)
        var months;
        months = (submissionDate.getFullYear() - startDay.getFullYear()) * 12;
        months = months - startDay.getMonth() + 1;
        months += submissionDate.getMonth();
        if(startDay.getDate() >= 11){
            months -= 1;
        }

        let remainingLeaves = months * 2.5 - leaves;
        // console.log(remainingLeaves + ' ' + months + ' ' + leaves)

        if(leaveType === 'AccidentalLeave' && duration > 6){
            res.status(404).send('You have up to 6 days');

            return;
        }

        if(leaveType === 'MaternityLeave' && sender.gender !== 'female'){
            res.status(404).send('You should be a woman :)');
            return;
        }

        if((leaveType === 'AccidentalLeave' || leaveType === 'AnnualLeave')){
            if(duration > remainingLeaves){
                res.status(404).send("You don't have these available leave days");

                return;
            }
            else{
                let newLeaves = parseInt(leaves, 10) + parseInt(duration, 10);
                const updateResponnse = await Member.updateOne({'id' : senderId}, {'leaves' : (newLeaves)}); //not sure
            }
        }


        if(leaveType === 'CompensationLeave' && (dayOff.getFullYear() !== submissionDate.getFullYear() || startDate.getFullYear() !== submissionDate.getFullYear() 
        || !(startDate.getMonth() === submissionDate.getMonth() && (startDate.getDate() > 10 || submissionDate.getDate() < 11) || startDate.getMonth() === submissionDate.getMonth() - 1 && startDate.getDate() > 10 && submissionDate.getDate() < 11))){
            res.status(404).send('enter valid dates');
            console.log(startDate + " " + content + ' ' + duration + ' ' + leaveType)
            console.log(startDate.getFullYear() + ' ' + dayOff.getFullYear())
            console.log(dayOff.getFullYear() !== submissionDate.getFullYear() || startDate.getFullYear() !== submissionDate.getFullYear())
            return;
        }

        if(leaveType === 'SickLeave' && startDate < submissionDate && Math.ceil((submissionDate-startDate)/(1000*60*60*24)) > 3){
            res.status(404).send('You can submit leave request by maximum 3 days');
            return;
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
            attachmentURL : attachmentUrl
        });
        await request.save();
        res.status(200).send('Change day off request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});

module.exports = router;