const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');

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

describe("testing login route", async() => {

    test('testing successful login', async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email, password : plainTextPassword});
        expect(res.headers.auth_token).not.toBeUndefined();
        const dbRes = await memberModel.findOne({id : member.id});
        expect(dbRes.loggedIn).toBeTruthy();
    })

    test("testing login with wrong email", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email + "sjcn", password : plainTextPassword});
        expect(res.text).toMatch('There is no user with such email');
    })

    test("testing login with wrong password", async() => {
        const {member, plainTextPassword} = await createMember();
        await member.save();
        const res = await request.post('/login').send({email : member.email, password : plainTextPassword + "jcns"});
        expect(res.text).toMatch('wrong password');
    })
});