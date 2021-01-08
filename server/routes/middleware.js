const jwt = require('jsonwebtoken');
const memberModel = require('../models/StaffMember');

//middleware for authentication
const authentication = async (req, res, next) => {
    const token = req.headers.auth_token;
    if(token == undefined)
        return res.status(401).send("you are not authorized to view this page");
    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        const member = await memberModel.findOne({id : payload.id});
        if(member == null)
            return res.status(401).send('no such user exists');
        if(!member.loggedIn)
            return res.status(401).send("You are not currently logged in");
        req.body.member = member;
        next();
    }
    catch(err) {
        res.status(401).send('you are not authorized to view this page');
    }
};

module.exports.authentication = authentication;