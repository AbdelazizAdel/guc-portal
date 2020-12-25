const express = require('express');
const router = express.Router();
const Department = require('../models/Department.js');
const Member = require('../models/Member.js');
const Request = require('../models/Request.js');
const Slot = require('../models/Slot.js');
const Attendance = require('../models/Attendance.js');
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

router.post('/replacement/request', [Authentication], async (req, res) => {
    try{
        let requestId = await MetaData.find({'sequenceName':`request`}).lastId;
        let courseId = req.body.courseId;
        let sender = req.body.member.id;
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
            sender: req.body.member.id,
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
        let requestId = await MetaData.find({'sequenceName':`request`}).lastId;
        let courseId = req.body.courseId;
        let sender = req.body.member.id;
        if(courseId === undefined){
            res.status(404).send('Please choose a course');
        }

        let course = await Course.find({'id': courseId})[0]

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

router.delete('/request/:requestID', [Authentication], async(req, res) => {
    const {id} = req.body.member;
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