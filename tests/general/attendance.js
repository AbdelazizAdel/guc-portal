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

describe("testing view attendance routes", () => {

    test("testing viewing all attendance records", async() => {
        const {member, plainTextPassword} = await createMember();
        member.attendance = [{signIn : new Date()}, {signOut : new Date()}, {signIn : new Date(), signOut : new Date()}];
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/attendance').set('auth_token', token);
        expect(res.body).toHaveLength(3);
    })

    test("testing viewing attendance records in the current month", async() => {
        const {member, plainTextPassword} = await createMember();
        member.attendance = [{signIn : new Date()}, {signOut : new Date()},
            {signIn : new Date(2020, 11, 1), signOut : new Date(2020, 11, 1, 12)}];
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const year = new Date().getFullYear(), month = new Date().getMonth();
        const res = await request.get(`/attendance/${year}/${month}`).set('auth_token', token);
        expect(res.body).toHaveLength(2);
    })

    test("testing viewing attendance records in a previous month", async() => {
        const {member, plainTextPassword} = await createMember();
        member.attendance = [{signIn : new Date()}, {signOut : new Date()},
            {signIn : new Date(2020, 10, 9, 2), signOut : new Date(2020, 10, 9, 12)},
            {signIn : new Date(2020, 10, 12, 5), signOut : new Date(2020, 10, 12, 8)}];
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const year = new Date().getFullYear(), month = new Date().getMonth() - 1;
        const res = await request.get(`/attendance/${year}/${month}`).set('auth_token', token);
        expect(res.body).toHaveLength(1);
    })

    test("testing viewing attendance records in a far previous month", async() => {
        const {member, plainTextPassword} = await createMember();
        member.attendance = [{signIn : new Date()}, {signOut : new Date()},
            {signIn : new Date(2020, 2, 9, 2), signOut : new Date(2020, 2, 9, 12)},
            {signIn : new Date(2020, 10, 12, 5), signOut : new Date(2020, 10, 12, 8)},
            {signIn : new Date(2020, 1, 19, 2), signOut : new Date(2020, 1, 19, 12)}];
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const year = new Date().getFullYear()
        const res = await request.get(`/attendance/${year}/01`).set('auth_token', token);
        expect(res.body).toHaveLength(2);
    }, 15000)
})
