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

// route for viewing attendance
router.get('/attendance', [authentication], async(req, res) => {
    const {attendance} = req.body.member;
    const {month} = req.query;
    if(month !== undefined) {
        if(!(typeof(month) == 'number' && month >= 0 && month <= 11))
            return res.send('this is not a valid month');
        const result = attendance.filter((record) => {
            return (record.signIn !== undefined && record.signIn.getMonth() === month) ||
            (record.signOut !== undefined && record.signOut.getMonth() === month);
        });
        return res.send(result);
    }
    res.send(attendance);
})

module.exports = router;