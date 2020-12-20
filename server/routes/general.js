const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const memberModel = require('../models/StaffMember');
const {authentication} = require('./middleware');

//route for logging in
router.post('/login', async(req, res) => {
    const {email, password} = req.body;
    if(email == undefined)
        return res.send("please enter an email");
    if(password == undefined)
        return res.send('please enter a password');
    const member = await memberModel.findOne({email});
    if(member == null)
        return res.send("There is no user with such email");
    const isCorrect = await bcrypt.compare(password, member.password);
    if(!isCorrect)
        return res.send('wrong password');
    await memberModel.updateOne({email}, {loggedIn : true});
    const token = jwt.sign({id : member.id}, process.env.TOKEN_SECRET);
    res.header('auth_token', token).send(token);
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
        return res.send('old password is required');
    if(newPass == undefined)
        return res.send('new Password is required');
    const isCorrect = await bcrypt.compare(oldPass, member.password);
    if(!isCorrect)
        return res.send('old password is incorrect');
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
    if(gender !== undefined && gender !== 'male' && gender !== 'female')
        return res.send('this is not a valid gender');
    if(email !== undefined && !emailIsValid(email))
        return res.send('this is not a valid email');
    if(email != undefined)
        member.email = email;
    if(gender != undefined)
        member.gender = gender;
    await memberModel.updateOne({id : member.id}, member);
    res.send('profile updated successfully');
})

//route for signing in
//TODO check if authentication is required or not
router.get('/signin', [authentication], async(req, res) => {
    const {member} = req.body;
    const record = {
        signIn : Date.now
    };
    if(member.attendance == undefined)
        member.attendance = [];
    member.attendance.concat([record]);
    await memberModel.updateOne({id : member.id}, member);
    res.send('sign in recorded successfully');
})


// route for signing out
//TODO check if authentication is required or not
router.get('/signout', [authentication], async(req, res) => {
    const {attendance} = req.body.member;
    const signOutDate = Date.now();
    if(attendance === undefined || attendance.length === 0) 
        attendance = [{signOut : signOutDate}];
    else {
        const last = attendance[attendance.length - 1];
        if(last.signIn === undefined || last.signOut !== undefined)
            attendance[attendance.length] = {signOut : signOutDate};
        else {
            if(last.signIn.getDay() === signOutDate.getDay())
                attendance[attendance.length - 1].signOut = signOutDate;
            else
            attendance[attendance.length] = {signOut : signOutDate};
        }
    }
    await memberModel.updateOne({id : req.body.member.id}, {attendance});
    res.send('signout recorded successfully');
})

// route for viewing all attendance records
router.get('/attendance', [authentication], (req, res) => {
    res.send(req.body.member.attendance);
})

// function which checks for valid year
function isYearValid(year) {
    return /^\d{4}$/.test(year);
}

// function which checks for valid month
function isMonthValid(month) {
    return /^(0[0-9]|1[0-1])$/.test(day);
}

// route for viewing attendance of a specific month
router.get('/attendance/:year/:month', [authentication], (req, res) => {
    const {attendance} = req.body.member;
    const {year, month} = req.params;
    if(!isYearValid(year))
        return res.send('this is not a valid year');
    if(!isMonthValid(month))
        return res.send('this is not a valid month');
    year = Number(year);
    month = Number(month);
    let result = [];
    const curDate = Date.now(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
    if(year === curYear && month === curMonth) {
        if(curDay > 11) {
            const start = new Date(year, month, 1).getTime(), end = new Date(year, month, curDay).getTime() - 1;
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
        const eleventhDayNextMonth = new Date(nextYear, nextMonth, 11);
        let start = new Date(year, month, 11).getTime(), end;
        if(curDate.getTime() >= eleventhDayNextMonth)
            end = eleventhDayNextMonth.getTime() - 1;
        else
            end = new Date(curYear, curMonth, curDay).getTime() - 1;
        result = attendance.filter((elem) => {
            const signIntime = elem.signIn === undefined ? -1 : elem.signIn.getTime();
            const signOutTime = elem.signOut === undefined ? -1 : elem.signOut.getTime();
            return (signIntime >= start && signIntime <= end) || (signOutTime >= start && signOutTime <= end); 
        });
    }
    res.send(result);
})


module.exports = router;