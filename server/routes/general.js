const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const memberModel = require('../models/StaffMember');
const requestModel = require('../models/Request');
const {authentication} = require('./middleware');
const superagent = require('superagent');
const router = express.Router();
const day_ms = 86400000; // number of milliseconds in a day
const dotenv = require('dotenv');
dotenv.config();

//route for logging in
router.post('/login', async(req, res) => {
    const {email, password} = req.body;
    if(email == undefined)
        return res.status(401).send("please enter an email");
    if(password == undefined)
        return res.status(401).send('please enter a password');
    if(typeof(email) != 'string' || typeof(password) != 'string')
        return res.status(401).send('please enter valid data types');
    const member = await memberModel.findOne({email});
    if(member == null)
        return res.status(401).send("There is no user with such email");
    const isCorrect = await bcrypt.compare(password, member.password);
    if(!isCorrect)
        return res.status(401).send('wrong password');
    await memberModel.updateOne({email}, {loggedIn : true});
    const token = jwt.sign({id : member.id}, process.env.TOKEN_SECRET);
    if(member.firstLogin == undefined || member.firstLogin == true) {
        await memberModel.updateOne({email}, {firstLogin : false});
        return res.header('auth_token', token).send('please change your password');
    }
    res.header('auth_token', token).send(member.id);
});

//route for logging out
router.get('/logout', [authentication], async(req, res) => {
    await memberModel.updateOne({id : req.body.member.id}, {loggedIn : false});
    res.send('logged out successfully');
})

// route for viewing profile
router.get('/profile', [authentication], async (req, res) => {
    res.send(req.body.member);
});

//route for changing password
router.post('/changePassword', [authentication], async(req, res) => {
    const {oldPass, newPass, member} = req.body;
    if(oldPass == undefined)
        return res.status(400).send('old password is required');
    if(newPass == undefined)
        return res.status(400).send('new Password is required');
    if(typeof(oldPass) != 'string' || typeof(newPass) != 'string')
        return res.status(400).send('please enter valid data types');
    const isCorrect = await bcrypt.compare(oldPass, member.password);
    if(!isCorrect)
        return res.status(400).send('old password is incorrect');
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(newPass, salt);
    await memberModel.updateOne({id : member.id}, {password : hashedPass});
    res.send('password changed succesfully');
})

// function that tests email format
function emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// route for updating profile
router.post('/updateProfile', [authentication], async(req, res) => {
    const {gender, email, member} = req.body;
    if(gender !== undefined) {
        if(gender !== 'male' && gender !== 'female')
            return res.status(401).send('this is not a valid gender');
        if(typeof(gender) != 'string')
            return res.status(401).send('please enter valid data types');
        member.gender = gender;
    }
    if(email !== undefined) {
        if(!emailIsValid(email))
            return res.status(401).send('this is not a valid email');
        if(typeof(email) !== 'string')
            return res.status(401).send('please enter valid data types');
        member.email = email;
    }
    await memberModel.updateOne({id : member.id}, member);
    res.send('profile updated successfully');
})

//route for signing in
//TODO check if authentication is required or not
router.get('/signin', [authentication], async(req, res) => {
    const {member} = req.body;
    const record = {
        signIn : new Date()
    };
    if(member.attendance == undefined)
        member.attendance = [];
    member.attendance[member.attendance.length] = record;
    await memberModel.updateOne({id : member.id}, member);
    res.send('sign in recorded successfully');
})


// route for signing out
//TODO check if authentication is required or not
router.get('/signout', [authentication], async(req, res) => {
    let {attendance, id} = req.body.member;
    const signOutDate = new Date();
    if(attendance === undefined || attendance.length === 0) 
        attendance = [{signOut : signOutDate}];
    else {
        const last = attendance[attendance.length - 1];
        if(last.signOut !== undefined)
            attendance[attendance.length] = {signOut : signOutDate};
        else {
            if(last.signIn.getFullYear() == signOutDate.getFullYear() && last.signIn.getMonth() == signOutDate.getMonth()
            && last.signIn.getDate() == signOutDate.getDate())
                attendance[attendance.length - 1].signOut = signOutDate;
            else
                attendance[attendance.length] = {signOut : signOutDate};
        }
    }
    await memberModel.updateOne({id}, {attendance});
    res.send('signout recorded successfully');
})

// route for viewing all attendance records
router.get('/attendance', [authentication], (req, res) => {
    let {attendance} = req.body.member;
    if(attendance === undefined)
        attendance = [];
    res.send(attendance);
})

// function which checks for valid year
function isYearValid(year) {
    return /^\d{4}$/.test(year);
}

// function which checks for valid month
function isMonthValid(month) {
    return /^([0-9]|1[0-1])$/.test(month);
}

// route for viewing attendance of a specific month
router.get('/attendance/:year/:month', [authentication], (req, res) => {
    const {attendance} = req.body.member;
    if(attendance == undefined)
        return res.send([]);
    let {year, month} = req.params;
    if(!isYearValid(year))
        return res.send('this is not a valid year');
    if(!isMonthValid(month))
        return res.send('this is not a valid month');
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
    res.send(result);
})

// function for getting attendance records based on the current day
async function getAttendanceRecords(token) {
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
    const response = await superagent.get(`http://localhost:${process.env.PORT}/attendance/${year}/${month}`).set('auth_token', token);
    const records = response.body.map((elem) => {
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

// route for getting missing days
router.get('/missingDays', [authentication], async(req, res) => {
    const {dayOff, id} = req.body.member;
    const {records, startYear, startMonth} = await getAttendanceRecords(req.headers.auth_token);
    const numDays = numOfDays(startYear, startMonth);
    const firstDay = new Date(startYear, startMonth, 11).getTime();
    let days = createDays(firstDay, numDays);
    for(let i = 0; i < records.length; i++) {
        if(!isValidRecord(records[i]))
            continue;
        const year = records[i].signIn.getFullYear(), month = records[i].signIn.getMonth(), day = records[i].signIn.getDate();
        days[String(new Date(year, month, day).getTime())] = false;
    }
    const requests = await requestModel.find({sender : id, status : 'Accepted'}).or([
        {type : 'AnnualLeave'}, {type : 'AccidentalLeave'}, {type : 'SickLeave'}, {type : 'MaternityLeave'}
    ]);
    const compensationLeaves = await requestModel.find({
        sender : id,
        status : 'Accepted',
        type : 'CompensationLeave',
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
    res.send(result);
})

//route for getting missing hours or extra hours
router.get('/missingHours', [authentication], async(req, res) => {
    const {dayOff, id} = req.body.member;
    const {records, startYear, startMonth} = await getAttendanceRecords(req.headers.auth_token);
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
        status : 'Accepted',
        type : 'CompensationLeave',
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
    res.send({missingHours : result});
})

module.exports = router;