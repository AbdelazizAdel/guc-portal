const jwt = require('jsonwebtoken');

//middleware for authentication
const authentication = (req, res, next) => {
    const token = req.headers.auth_token;
    if(token == undefined)
        return res.send("you are not authorized to view this page");
    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        req.body.memberID = payload.id;
        next();
    }
    catch(err) {
        res.send('you are not authorized to view this page');
    }
};

module.exports.authentication = authentication;