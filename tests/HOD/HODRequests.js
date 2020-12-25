const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const CourseModel = require('../../server/models/Course.js');
const departmentModel = require('../../server/models/Department.js');
const requestModel = require('../../server/models/Request.js');
const {createMember} = require('../general/helper');
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

let token, staff;
beforeEach(async () => {
    await memberModel.deleteMany();
    await CourseModel.deleteMany();
    await departmentModel.deleteMany();
    await requestModel.deleteMany();
    const {member, plainTextPassword} = await createMember();
    await createCourse(course, 'analysis');
    await createDepartment();
    staff = await createStaffMembers();
    await member.save();
    const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
    token = response.headers.auth_token;
});


afterAll(async()=>{
    await memberModel.deleteMany();
    await requestModel.deleteMany();
})

async function createCourse(courseId, courseName){
    const courseA = new CourseModel({
        id: courseId,
        name: courseName,
        mainDepartment : 'd-1',
    });
    
    await courseA.save();
}
var course = 'CSEN 703';
var instructors = ['ac-2', 'ac-4', 'ac-6', 'ac-8'];

async function createDepartment(){
    const department = new departmentModel({
        id: 'd-1',
        name: 'Computer Science',
        HOD: 'ac-1'
    })

    await department.save();
}



const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();

let attendance = [];
for(let i = 11; i < curDay - 2; i++)
    attendance[attendance.length] = {signIn : new Date(curYear, curMonth, i, 8), signOut : new Date(curYear, curMonth, i, 13)};


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


// describe('testing HOD requests', ()=>{
//     test('testing view change day off requests', async()=>{
//         const req = new requestModel({
//             id: 'req-1',
//             sender: 'ac-2',
//             receiver: 'ac-1',
//             status: 'pending',
//             content: 'day off',
//             type: "ChangeDayOff",
//             dayOff : 5
//         }) 
//         await req.save();
//         const res = await request.get('/viewChangeDayOffRequests').set('auth_token', token);
//         expect(res.body[0].id).toBe(req.id);
//     })
//     test('testing view change leave requests', async()=>{
//         const req = new requestModel({
//             id: 'req-1',
//             sender: 'ac-2',
//             receiver: 'ac-1',
//             status: 'pending',
//             content: 'day off',
//             type: "AnnualLeave"
//         }) 
//         await req.save();
//         const req2 = new requestModel({
//             id: 'req-2',
//             sender: 'ac-4',
//             receiver: 'ac-1',
//             status: 'pending',
//             content: 'day off',
//             type: "SickLeave"
//         }) 
//         await req2.save();
//         const res = await request.get('/viewLeaveRequests').set('auth_token', token);
//         console.log(res.body)
//         expect(res.body[0].id).toBe(req.id);
//         expect(res.body[1].id).toBe(req2.id);
//     })
// })

describe('testing accept/reject requests',()=>{
  test('testing accept change-day off request', async()=>{
    const req = new requestModel({
        id: 'req-1',
        sender: 'ac-2',
        receiver: 'ac-1',
        status: 'pending',
        content: 'day off',
        type: "ChangeDayOff",
        startDate: new Date(),
        dayOff : 5
    }) 
    await req.save();
    const res = await request.post('/HOD/request').send({requestId: req.id, status: 'Accepted'}).set('auth_token', token);
    expect(200);
    expect(res.text).toMatch('Request is accepted successfully');
  })
  
  test('testing reject annual leave request', async()=>{
    const req = new requestModel({
        id: 'req-1',
        sender: 'ac-2',
        receiver: 'ac-1',
        status: 'pending',
        content: 'day off',
        type: "AnnualLeave",
        duration: 5,
        startDate: new Date()
    }) 
    await req.save();
    const res = await request.post('/HOD/request').send({requestId: req.id, status: 'Rejected'}).set('auth_token', token);
    expect(200);
    expect(res.text).toMatch('Request is Rejected successfully');
  })
})