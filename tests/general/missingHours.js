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

describe("testing missing hours route", () => {

    test("testing not attending all days fully", async() => {
        const {member, plainTextPassword} = await createMember();
        const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
        attendance = [];
        for(let i = 11; i <= curDay; i++)
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 10), signOut : new Date(curYear, curMonth, i, 12)};
        member.attendance = attendance;
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingHours').set('auth_token', token);
        expect(res.body.missingHours).toBe(10 * 8.4 - 12 * 2);
    })

    test("testing attending all days fully", async() => {
        const {member, plainTextPassword} = await createMember();
        const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
        attendance = [];
        for(let i = 11; i <= curDay; i++) {
            if(i == 11 || i == 12 || i == 18 || i == 19)
                continue;
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 15, 24)};
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 16), signOut : new Date(curYear, curMonth, i, 17)};
        }
        member.attendance = attendance;
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingHours').set('auth_token', token);
        expect(res.body.missingHours).toBe(0);
    })

    test("testing having compensation days", async() => {
        const {member, plainTextPassword} = await createMember();
        const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
        attendance = [];
        for(let i = 11; i <= curDay; i++) {
            if(i == 11 || i == 12 || i == 18 || i == 19 || 25)
                continue;
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 15, 24)};
            attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 16), signOut : new Date(curYear, curMonth, i, 17)};
        }
        //attendance[attendance.length] = {signIn : new Date(2020, 11, 19, 5), signOut : new Date(2020, 11, 19, 9)};
        member.attendance = attendance;
        await member.save();
        await createRequest(new Date(2020, 11, 16), undefined, 'CompensationLeave', new Date(2020, 11, 19)).save();
        await createRequest(new Date(2020, 10, 16), undefined, 'CompensationLeave', new Date(2020, 10, 21)).save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/missingHours').set('auth_token', token);
        expect(res.body.missingHours).toBe(0);
    })
})