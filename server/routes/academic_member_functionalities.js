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
const Authentication = require('./middleware.js');
const MetaData = require('../models/metaData.js');

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

module.exports = router;