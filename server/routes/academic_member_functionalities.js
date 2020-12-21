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

router.get('/schedule', [Authentication],(req, res)=>{

    try{

        let staffId = req.body.member.id;

        let schedule = [];

        let scheule = Slot.find.and([{'instructor':{"$in":`${staffId}`}}]);

        let replacements = Replacement.filter.and([{'instructor':{"$in":`${staffId}`}}])
        scheule = schedule.concat(replacements);
        response = {'schedule' : schedule};
        res.status(200).send(response);
    }
    catch(err){
            console.log(err);
            res.status(404).send('fe blabizo 7asal hena');
    }
});

router.post('/replacement/request', [Authentication], (req, res) => {
    try{
        requestId = MetaData.find().and([{'sequenceName':{"$in":`replacementSlot`}}])['lastId'];
        const request = new Request({
            id: requestId,
            sender: req.body.member.id,
            receiver: req.body.receiver,
            status: 'Pending',
            content: req.body.content,
            comment: req.body.comment,
            type: 'replacementSlot',
            submissionDate: Date.now(),
            startDate: req.body.startDate,
            duration: req.body.duration,
            slot: req.body.slot,
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
})