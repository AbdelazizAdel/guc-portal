const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const {createMember} = require('./helper');
const bcrypt = require('bcrypt');

try {
    (async () => {await mongoose.connect(process.env.DB_URL_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })})();
}
catch(err) {
    console.log(err);
}

beforeEach(async () => {
    await memberModel.deleteMany();
});

describe('testing change password route', () => {

    test('testing correct old password case', async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = res.headers.auth_token;
        const response = await request.post('/changePassword').send({
            oldPass : plainTextPassword,
            newPass : "newPass"
        }).set('auth_token', token);
        expect(response.text).toMatch('password changed succesfully');
        const updatedMem = await memberModel.findOne({id : member.id});
        const isCorrect = await bcrypt.compare("newPass", updatedMem.password);
        expect(isCorrect).toBeTruthy();
    })

    test('testing wrong old password case', async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = res.headers.auth_token;
        const response = await request.post('/changePassword').send({
            oldPass : plainTextPassword + "nsvnsj",
            newPass : "newPass"
        }).set('auth_token', token);
        expect(response.text).toMatch('old password is incorrect');
    })

    test('testing no old password case', async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = res.headers.auth_token;
        const response = await request.post('/changePassword').send({
            newPass : "newPass"
        }).set('auth_token', token);
        expect(response.text).toMatch('old password is required');
    })

})