const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const CourseModel = require('../../server/models/Course.js');
const departmentModel = require('../../server/models/Department.js');
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
    await createStaffMembers();
});

afterAll(async()=>{
    await memberModel.deleteMany();
})
const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();

let attendance = [];
for(let j = 11; j < curDay; j++)
    attendance[attendance.length] = {signIn : new Date(curYear, curMonth, j, 8), signOut : new Date(curYear, curMonth, j, 10)};

async function createStaffMembers(){
    let staff = [];

    for(let i=2;i<10;i+=2){ 
        const memberA = new memberModel({
            id: 'ac-'+i,
            email: 'ac-'+i+'@guc.edu.eg',
            name: 'ac-'+i,
            department: 'd-1',
            dayOff: i%7,
            attendance: attendance
        });
        staff.push(memberA);
        await memberA.save();
    }
    return staff;
}

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

describe('testing view any staff member attendance', ()=>{
    test('view attendance', async()=>{
        const{hr, plainTextPassword}= await createHR();
        const response = await request.post('/login').send({email : hr.email, password : plainTextPassword});
        const token = response.headers.auth_token;
        const res = await request.get(`/HR/attendance/${curYear}/${curMonth}/ac-2`).set('auth_token', token);
        expect(200);
        console.log(attendance)
        for(let i=0;i<res.body.length;i++){
            expect(new Date(res.body[i].signIn)).toEqual(attendance[i].signIn);
            expect(new Date(res.body[i].signOut)).toEqual(attendance[i].signOut);
        }
    })
})