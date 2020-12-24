const memberModel = require('../../server/models/StaffMember.js');
const requestModel = require('../../server/models/Request');
const app = require('../../server/app.js').app;
const bcrypt = require('bcrypt');
const superagent = require('superagent');

async function createMember() {
    const member = new memberModel({
        id : 'ac-1',
        password: 'kcsckcsk',
        email : 'zizo.1999@live.com',
        loggedIn : false,
        dayOff : 6
    });
    const plainTextPassword = member.password;
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(member.password, salt);
    member.password = hashedPass;
    return {
        member,
        plainTextPassword
    };
}

function createRequest(startDate, duration, type) {
    const request = new requestModel({
        sender : 'ac-1',
        reciever : 'ac-2',
        status : 'accepted',
        type,
        startDate,
        duration
    });
    return request;
}

module.exports = {
    createMember,
    createRequest
};