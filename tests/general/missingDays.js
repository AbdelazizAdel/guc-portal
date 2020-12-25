const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const requestModel = require('../../server/models/Request.js');
const {createMember, createRequest} = require('./helper');

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
    await requestModel.deleteMany();
});



describe("testing missing days route", () => {

    test("testing attending all days case", async() => {
        const {member, plainTextPassword} = await createMember();
        const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
        attendance = [];
        for(let i = 11; i <= curDay; i++)
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 10)};
        member.attendance = attendance;
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingDays').set('auth_token', token);
        expect(res.body).toHaveLength(0);
    }, 15000)

    test("testing missing some days case", async() => {
        const {member, plainTextPassword} = await createMember();
        const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
        attendance = [];
        for(let i = 11; i < curDay - 2; i++)
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 10)};
        member.attendance = attendance;
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingDays').set('auth_token', token);
        expect(res.body).toHaveLength(3);
    }, 15000)

    test("testing dayoff case", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingDays').set('auth_token', token);
        expect(res.body).toHaveLength(10);
    }, 15000)

    test("testing leave requests case", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        await createRequest(new Date(2020, 11, 20), 2, 'SickLeave').save();
        await createRequest(new Date(2020, 11, 22), 1, 'AnnualLeave').save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingDays').set('auth_token', token);
        expect(res.body).toHaveLength(7);
    }, 15000)

    test("testing compensation requests case", async() => {
        const {member, plainTextPassword} = await createMember();
        member.attendance = [{signIn : new Date(2020, 11, 19, 5), signOut : new Date(2020, 11, 19, 9)}];
        await member.save();
        await createRequest(new Date(2020, 11, 16), undefined, 'CompensationLeave', new Date(2020, 11, 19)).save();
        await createRequest(new Date(2020, 10, 16), undefined, 'CompensationLeave', new Date(2020, 10, 21)).save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingDays').set('auth_token', token);
        expect(res.body).toHaveLength(9);
    }, 15000)


})