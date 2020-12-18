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

describe("testing view profile route", () => {

    test("testing view profile route when logged in", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const profile = await request.get('/profile').set('auth_token', token);
        expect(profile.body.id).toMatch(member.id);
        expect(profile.body.email).toMatch(member.email);
        expect(profile.body.password).toMatch(member.password);
        expect(profile.body.loggedIn).toBeTruthy();
    })

    test("testing view profile route when logged out", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        await request.get('/logout').set('auth_token', token);
        const profile = await request.get('/profile').set('auth_token', token);
        expect(profile.text).toMatch("Please Log in to view your profile");
    })

})