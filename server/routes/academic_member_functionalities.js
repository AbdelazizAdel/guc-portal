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
const authentication = require('./middleware.js');

router.use(express.json());

router.get('/schedule', [authentication],(req, res)=>{

    let staffId = req.body.id;

    let schedule = [];

    let scheule = Slot.filter((slot) => {
        return slot.instructor === staffId;
    }
    );

    let replacements = Replacement.filter((replacement) => {
        return replacement.instructor === staffId;
    });
    scheule = schedule.concat(replacements);
    return schedule;
});

router.post('/replacement/add', [authentication], (req, res) => {
    try{
        const replacementSlot = new Replacement({
        id: {type: String, required: true, unique: true},
        day: Number,
    period: Number,
    date: Date, 
    location: String, 
    slotType: String, 
    course: String,
    instructor: String
          })
        console.log(typeof(member));
        member.save((err,doc)=>{
            if(err) return console.log(err);
            console.log('Document inserted successfully');
        });
        res.status(200).send('Member added successfully');
    }
    catch(err) {
        console.log(err);
        res.status(404).send('fih moshkla ya mealem');

    }
})