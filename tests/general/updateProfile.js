const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const {createMember} = require('./helper');

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

describe('testing update profile route', () => {

    test("tetsing updating gender only", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.post('/updateProfile').send({gender : 'female'}).set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(res.text).toMatch('profile updated successfully');
        expect(dbRes.gender).toMatch('female');
    })

    test("tetsing updating email only", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.post('/updateProfile').send({email : 'abdo@gmail.com'}).set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(res.text).toMatch('profile updated successfully');
        expect(dbRes.email).toMatch('abdo@gmail.com');
    })

    test("tetsing updating email only using invalid email", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.post('/updateProfile').send({email : 'abdo_gmail.com'}).set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(res.text).toMatch('this is not a valid email');
        expect(dbRes.email).toMatch(member.email);
    })
    
})