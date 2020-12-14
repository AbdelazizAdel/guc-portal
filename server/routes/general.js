const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const memberModel = require('../models/Member');

router.use(express.json());
router.use((req, res, next) => {
    const token = req.headers.auth_token;
    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        req.body.memberID = payload.id;
        next();
    }
    catch(err) {
        res.send('Please Log in to view this page');
    }
});
router.post('/profile', async (req, res) => {
    const id = req.body.memberID;
    const member = memberModel.find({id});
    if(member.length == 0) {
        res.send('no such user exists');
    }
    else {
        res.send(member[0]);
    }
});

module.exports = router;