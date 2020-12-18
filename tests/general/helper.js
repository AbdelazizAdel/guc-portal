const memberModel = require('../../server/models/StaffMember.js');
const app = require('../../server/app.js').app;
const bcrypt = require('bcrypt');
const superagent = require('superagent');

async function createMember() {
    const member = new memberModel({
        id : 'ac-1',
        password: 'kcsckcsk',
        email : 'zizo.1999@live.com',
        loggedIn : false
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

module.exports = {
    createMember
};