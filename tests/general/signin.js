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

describe("testing signin route", () => {

    test("testing successful signin insertion in the database", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        await request.get('/signin').set('auth_token', token);
        const dbRes = await memberModel.findOne({id : member.id});
        expect(dbRes.attendance).toHaveLength(1);
        expect(dbRes.attendance[0].signIn).not.toBeUndefined();
        expect(dbRes.attendance[0].signOut).toBeUndefined();
    })
})