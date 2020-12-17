const app = require('../server/app.js');
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../server/models/StaffMember.js');

try {
    (async () => {await mongoose.connect(process.env.DB_URL_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })})();
}
catch(err) {
    console.log(err);
}

beforeAll(async () => {
    await memberModel.deleteMany();
});

test("testing database insertion", async () => {
    const member = new memberModel({
        id : 'ac-1',
        password: 'kcsckcsk',
        email : 'zizo.1990@live.com',
        gender : 'male'
    });
    await member.save();
    const res = await memberModel.find({id : member.id});
    expect(res).toHaveLength(1);
    expect(res[0].id).toMatch(member.id);
    expect(res[0].password).toMatch(member.password);
    expect(res[0].email).toMatch(member.email);
}, 15000);

