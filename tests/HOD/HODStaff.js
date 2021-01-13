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
const {createMember} = require('../general/helper');

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
    const {member, plainTextPassword} = await createMember();
    await createCourse(course, 'analysis');
    await createDepartment();
    staff = await createStaffMembers();
    await member.save();
    const response = await request.post('/login').send({email : member.email, password : plainTextPassword});
    token = response.headers.auth_token;
});

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

async function createStaffMembers(){
    let staff = [];
    for(let i=2;i<10;i+=2){
        const memberA = new memberModel({
            id: 'ac-'+i,
            email: 'ac-'+i+'@guc.edu.eg',
            name: 'ac-'+i,
            department: 'd-1',
            dayOff: i%7
        });
        staff.push(memberA);
        await memberA.save();
    }
    return staff;
}


describe('testing assign/delete/update a course instructor', ()=>{
    let instructor2 = 'ac-10';

    test('testing assign', async()=>{
        let res;
        for(instructor of instructors)
            res = await request.post('/HOD/assignInstructor').send({courseId: course, instructorId: instructor}).set('auth_token', token);

        expect(res.body.instructors).toEqual(expect.arrayContaining(instructors));
    })

    test('testing update', async()=>{
        for(instructor of instructors)
            await request.post('/HOD/assignInstructor').send({courseId: course, instructorId: instructor}).set('auth_token', token);

        const res = await request.put('/HOD/updateInstructor').send({courseId: course, instructorId1: instructors[0], instructorId2: instructor2}).set('auth_token', token);

        expect(res.body.instructors).not.toEqual(expect.arrayContaining([instructors[0]]));
        expect(res.body.instructors).toEqual(expect.arrayContaining([instructor2]));
    })

    test('testing delete', async()=>{
        for(instructor of instructors)
            await request.post('/HOD/assignInstructor').send({courseId: course, instructorId: instructor}).set('auth_token', token);
        const res = await request.delete('/HOD/deleteInstructor').send({courseId: course, instructorId: 'ac-2'}).set('auth_token', token);
        expect(res.status).toBe(200);
        expect(res.body.instructors).not.toEqual(expect.arrayContaining(['ac-2']));
    }) 
})


describe('testing view Staff', ()=>{
    test('view all staff', async()=>{

        const res = await request.get('/HOD/viewStaff').send().set('auth_token', token);
        for(let i=0; i< staff.length; i++){
            expect(res.body[i].id).toEqual(staff[i].id);
        }
    })

    test('view staff per course', async()=>{

        for(instructor of instructors)
            await request.post('/HOD/assignInstructor').send({courseId: course, instructorId: instructor}).set('auth_token', token);


        const res = await request.get('/HOD/viewStaff').send({courseId: 'CSEN 703'}).set('auth_token', token);
        expect(res.body.courseId).toEqual('CSEN 703');
        for(let i=0;i<4;i++)
            expect(res.body.staff[i].id).toEqual(instructors[i]);
    })
})

