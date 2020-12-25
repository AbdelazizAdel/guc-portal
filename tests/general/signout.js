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

describe("testing signout route", () => {

    test("testing inserting a new signout record", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        await request.get('/signout').set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        console.log(dbRes);
        expect(dbRes.attendance).toHaveLength(1);
        expect(dbRes.attendance[0].signOut).not.toBeUndefined();
        expect(dbRes.attendance[0].signIn).toBeUndefined();
    })

    test("testing appending signout to an already exisiting signin record", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        await request.get('/signin').set('auth_token', token);
        await request.get('/signout').set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(dbRes.attendance).toHaveLength(1);
        expect(dbRes.attendance[0].signOut).not.toBeUndefined();
        expect(dbRes.attendance[0].signIn).not.toBeUndefined();
    })

    test("testing creating a new signout record when there is an old signin record", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        await memberModel.updateOne({id : member.id}, {attendance : [
            {signIn : new Date(2020, 11, 1, 2)}
        ]});
        await request.get('/signout').set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(dbRes.attendance).toHaveLength(2);
        expect(dbRes.attendance[1].signOut).not.toBeUndefined();
        expect(dbRes.attendance[1].signIn).toBeUndefined();
    })
})