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

module.exports = router;