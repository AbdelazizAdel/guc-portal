const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const memberModel = require('../models/StaffMember');
const requestModel = require('../models/Request');
const {authentication} = require('./middleware');
const superagent = require('superagent');
const StaffMember = require('../models/StaffMember');
const Joi = require('joi');
const router = express.Router();
const day_ms = 86400000; // number of milliseconds in a day


// function which checks for valid year
function isYearValid(year) {
    return /^\d{4}$/.test(year);
}

// function which checks for valid month
function isMonthValid(month) {
    return /^(0[0-9]|1[0-1])$/.test(month);
}

function isValidStaffId(id) {
    return new RegExp('ac-[1-9]\d*').test(id);
}

router.get('/attendance/:year/:month/:staffId', [authentication], async(req, res)=>{
    let {year, month, staffId} = req.params;
    if(!isYearValid(year))
        return res.send('this is not a valid year');
    if(!isMonthValid(month))
        return res.send('this is not a valid month');
    if(!isValidStaffId(staffId))
        return res.send('this is not a valid staffmember');
    console.log('here')

    const{attendance} = await StaffMember.findOne({id: staffId});
    console.log(attendance)
    if(attendance == undefined)
        return res.send([]);
    console.log(attendance)
    year = Number(year);
    month = Number(month);
    let result = [];
    const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
    if(year === curYear && month === curMonth) {
        if(curDay >= 11) {
            const start = new Date(year, month, 11).getTime(), end = new Date(year, month, curDay).getTime() + day_ms - 1;
            result = attendance.filter((elem) => {
                const signIntime = elem.signIn === undefined ? -1 : elem.signIn.getTime();
                const signOutTime = elem.signOut === undefined ? -1 : elem.signOut.getTime();
                return (signIntime >= start && signIntime <= end) || (signOutTime >= start && signOutTime <= end); 
            });
        }
    }
    else if(year <= curYear && month <= curMonth) {
        const nextYear = month == 11 ? year + 1 : year;
        const nextMonth = month == 11 ? 0 : month + 1;
        const tenthDayNextMonth = new Date(nextYear, nextMonth, 10);
        let start = new Date(year, month, 11).getTime(), end;
        if(curDate.getTime() >= tenthDayNextMonth.getTime())
            end = tenthDayNextMonth.getTime() + day_ms - 1;
        else
            end = new Date(curYear, curMonth, curDay).getTime() + day_ms - 1;
        result = attendance.filter((elem) => {
            const signIntime = elem.signIn === undefined ? -1 : elem.signIn.getTime();
            const signOutTime = elem.signOut === undefined ? -1 : elem.signOut.getTime();
            return (signIntime >= start && signIntime <= end) || (signOutTime >= start && signOutTime <= end); 
        });
    }
//    console.log(result)
    res.status(200).send(result);
})

// function for getting attendance records based on the current day
async function getAttendanceRecords(token, id) {
    const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
    let year, month;
    if(curDay >= 11) {
        year = curYear;
        month = curMonth;
    }
    else {
        year = curMonth == 0 ? curYear - 1 : curYear;
        month = curMonth == 0 ? 11 : curMonth - 1;
    }
    const response = await superagent.get(`http://localhost:3000/HR/attendance/${year}/${month}/${id}`).set('auth_token', token);
//    console.log(response.body)
    let records = response.body.map((elem) => {
            if(elem.signIn != undefined)
                elem.signIn = new Date(elem.signIn);
            if(elem.signOut != undefined)
                elem.signOut = new Date(elem.signOut);
            return elem;
        })
    return {
        records,
        startYear : year,
        startMonth : month
    };
}

// function for determining if the attendance record is valid or not
function isValidRecord(record) {
    const{signIn, signOut} = record;
    if(signIn == undefined || signOut == undefined)
        return false;
    const year = signIn.getFullYear(), month = signIn.getMonth(), day = signIn.getDate();
    const min = new Date(year, month, day, 7).getTime(), max = new Date(year, month, day, 19).getTime();
    if(signIn.getTime() > max || signOut.getTime() < min)
        return false;
    return true;
}

// function for determining the number of days passed in the current month (GUC month)
function numOfDays(startYear, startMonth) {
    const curDate = new Date(), curDay = curDate.getDate();
    let numDays;
    if(curDay >= 11)
        numDays = curDay - 11 + 1;
    else {
        const numDaysStartMonth = new Date(startYear, startMonth, 0).getDate();
        numDays = curDay + numDaysStartMonth - 11 + 1;
    }
    return numDays;
}

// function which creates an object of days given first day and the number of days
function createDays(firstDay, numDays) {
    let days = {};
    for(let i = 0; i < numDays; i++)
        days[String(firstDay + i * day_ms)] = true;
    return days;
}

async function missingDays(id, dayOff, token) {
    const {records, startYear, startMonth} = await getAttendanceRecords(token, id);
    const numDays = numOfDays(startYear, startMonth);
    const firstDay = new Date(startYear, startMonth, 11).getTime();
    let days = createDays(firstDay, numDays);
    for(let i = 0; i < records.length; i++) {
        if(!isValidRecord(records[i]))
            continue;
        const year = records[i].signIn.getFullYear(), month = records[i].signIn.getMonth(), day = records[i].signIn.getDate();
        days[String(new Date(year, month, day).getTime())] = false;
    }
    const requests = await requestModel.find({sender : id, status : 'accepted'}).or([
        {type : 'annual'}, {type : 'accidental'}, {type : 'sick'}, {type : 'maternity'}
    ]);
    const compensationLeaves = await requestModel.find({
        sender : id,
        status : 'accepted',
        type : 'compensation',
        startDate : {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)},
        dayOff :  {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)}
    });
    for(let i = 0; i < compensationLeaves.length; i++) {
        const d = compensationLeaves[i].dayOff, s = compensationLeaves[i].startDate;
        if(!days[String(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())])
            days[String(new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime())] = false;
    }
    for(let i = 0; i < numDays; i++) {
        let date = new Date(firstDay + i * day_ms);
        if(date.getDay() == 5 || date.getDay() == dayOff)
            days[String(date.getTime())] = false;
        else {
            let acceptedRequests = requests.filter((elem) => {
                let low = elem.startDate.getTime();
                let offset = elem.duration == undefined ? 1 : elem.duration;
                let high = low + offset * day_ms;
                return date.getTime() >= low && date.getTime() < high;
            })
            if(acceptedRequests.length > 0)
                days[String(date.getTime())] = false;
        }
    }
    let result = [];
    for(let i = 0 ; i < numDays; i++) {
        let date = new Date(firstDay + i * day_ms);
        if(days[String(date.getTime())] == true)
            result[result.length] = date;
    }
    return result;
}
router.get('/StaffMembersWithMissingDays', [authentication], async(req, res)=>{
    let staff = await StaffMember.find();
    let missingDays_staff = [];
    for(member of staff){
        let days = await missingDays(member.id, member.dayOff, req.headers.auth_token);
        if(!days){
            continue;
        }else{
            missingDays_staff.push({id: member.id, name: member.name, missingDays: days});
        } 
    }
    res.status(200).send(missingDays_staff);
})

async function missingHours(id, dayOff, token) {
    const {records, startYear, startMonth} = await getAttendanceRecords(token);
    const numDays = numOfDays(startYear, startMonth);
    const firstDay = new Date(startYear, startMonth, 11).getTime();
    const days = createDays(firstDay, numDays);
    let result = 0, cnt = 0;
    for(let i = 0; i < records.length; i++) {
        if(!isValidRecord(records[i]) || records[i].signIn.getDay() == 5)
            continue;
        const{signIn, signOut} = records[i];
        const year = signIn.getFullYear(), month = signIn.getMonth(), day = signIn.getDate();
        const start = new Date(year, month, day, 7), end = new Date(year, month, day, 19);
        days[String(new Date(year, month, day).getTime())] = false;
        const signInTime = Math.max(start.getTime(), signIn.getTime());
        const signOutTime = Math.min(end.getTime(), signOut.getTime());
        const spentTime = (signOutTime - signInTime) / (1000 * 60 * 60);
        result-=spentTime;
    }
    const compensationLeaves = await requestModel.find({
        sender : id,
        status : 'accepted',
        type : 'compensation',
        startDate : {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)},
        dayOff :  {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)}
    });
    let compensatedDayOffs = {};
    for(let i = 0; i < compensationLeaves.length; i++) {
        const d = compensationLeaves[i].dayOff;
        compensatedDayOffs[String(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())] = true;
    }
    for(let i = 0; i < numDays; i++) {
        const d = new Date(firstDay + i * day_ms);
        if((d.getDay() == dayOff && compensatedDayOffs[String(d.getTime())] == true && !days[String(d.getTime())]) ||
         (d.getDay() != dayOff && d.getDay() != 5 && !days[String(d.getTime())]))
            cnt++;
    }
    result = result + cnt * 8.4;
    return result;
}
router.get('/StaffMembersWithMissingHours', [authentication], async(req, res)=>{
    let staff = await StaffMember.find();
    let missingHours_staff = [];
    for(member of staff){
        let hours = await missingHours(member.id, member.dayOff, req.headers.auth_token);
        console.log(hours);
        if(!hours){
            continue;
        }else{
            missingHours_staff.push({id: member.id, name: member.name, missingHours: hours});
        }
    }
    res.status(200).send(missingHours_staff);
})
router.put('/updateSalary', [authentication], async(req, res)=>{
    const schema = Joi.object({
        newSalary: Joi.number().required(),
        staffId: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*'))
    })
    
    const{error, value} = schema.validate(req.body, {allowUnknown: true});
    if(!error){
        try{
            await StaffMember.findOneAndUpdate({id: value.id}, {salary: value.newSalary});
            res.status(200).send('Salary updated successfully');    
        }catch(e){
            res.status(404).send(e);
        }
    }else{
        res.status(403).send(error);
    }
})

module.exports = router