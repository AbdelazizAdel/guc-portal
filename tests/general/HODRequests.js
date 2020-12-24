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
const {createMember} = require('./helper');


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
            department: 'd-1'
        });
        staff.push(memberA);
        await memberA.save();
    }
    return staff;
}
