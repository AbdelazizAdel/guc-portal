const express = require('express');
const Router = express.Router();
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
            let dateToUse = Date.now();
            let lastSaturday = new Date().setDate(dateToUse.getDate() - (dateToUse.getDay() + 1));
            let nextFriday = new Date().setDate(lastSaturday.getDate() + 6);
            return replacement.date >= lastSaturday && replacement.date <= nextFriday;
        });
        let date = new Date().now();
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
        let requestId = await MetaData.find().and([{'sequenceName':{"$in":`replacementSlot`}}]).lastId;
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
        if(startDate === undefined || Date.now() > startDate){
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
            submissionDate: Date.now(),
            startDate: startDate,
            duration: req.body.duration,
            slot: slot,
            attachmentURL : req.body.attachmentURL
        });
        console.log(typeof(replacementSlot));
        request.save((err, slot)=>{
            if(err) return console.log(err);
            console.log('Replacement request sent successfully');
        });
        res.status(200).send('Replacement request sent successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');
    }
});