const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const requestModel = require('../../server/models/Request.js'); 
const bcrypt = require('bcrypt');


try {
    (async () => {await mongoose.connect(process.env.DB_URL_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })})();
}
catch(err) {
    console.log(err);
}

beforeEach(async () => {
    await memberModel.deleteMany();
    await requestModel.deleteMany();
});


afterAll(async()=>{
    await memberModel.deleteMany();
})


const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();

let attendance = [];
for(let i = 11; i < curDay - 2; i++)
    attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 13)};


async function createHR() {
    const hr = new memberModel({
        id: 'hr-1',
        email: 'moreda@guc.edu.eg',
        password: 'kcsckcsk',
        name: 'Mahmoud Reda',
        dayOff: 6,
        attendance: attendance,
        loggedIn: false
    })
    const plainTextPassword = hr.password;
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(hr.password, salt);
    hr.password = hashedPass;

    await hr.save();
    return {
        hr,
        plainTextPassword
    };
}

describe('testing view staff with missing days/hours', ()=>{
    test('testing view staff with missing days', async()=>{
        const{hr, plainTextPassword}= await createHR();
        const response = await request.post('/login').send({email : hr.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/HR/StaffMembersWithMissingDays').set('auth_token', token);
        console.log(res.body);
        expect(200);
    })

    test('testing view staff with missing hours', async()=>{
        const{hr, plainTextPassword}= await createHR();
        const response = await request.post('/login').send({email : hr.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get('/HR/StaffMembersWithMissingHours').set('auth_token', token);
        console.log(res.body);
        expect(200);
    })
})