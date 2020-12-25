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
const slotModel = require('../../server/models/Slot.js');
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
    await requestModel.deleteMany();
    await slotModel.deleteMany();
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
    await CourseModel.deleteMany();
    await departmentModel.deleteMany();
    await requestModel.deleteMany();
    await slotModel.deleteMany();
})
async function createCourse(courseId, courseName){
    const courseA = new CourseModel({
        id: courseId,
        name: courseName,
        mainDepartment : 'd-1',
        numSlots: 20
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

describe('view coverage of each course in the department', ()=>{
    test('view coverage', async()=>{
        let n = 5;
        for(let i=0;i<n;i++){
            const slot = new slotModel({
                id: 'slot-'+i,
                day: i,
                period: i%5,
                location: `C${i%7}-${i}07`,
                course: course
            });
            await slot.save();
        }

        const res = await request.get('/HOD/viewCoverage').set('auth_token', token);
        console.log(res.body);
        expect(200);
        expect(res.body[0].coverage).toBe((n/20)*100);
    })
})

describe('view teaching assignments', ()=>{
    test('view teaching assignments of course CSEN 703', async()=>{
        let n = 5;
        for(let i=0;i<n;i++){
            const slot = new slotModel({
                id: 'slot-'+i,
                day: i,
                period: i%5,
                location: `C${i%7}-${i}07`,
                course: course,
                instructor: instructors[i%4]
            });
            await slot.save();
        }
        const res = await request.get('/HOD/viewTeachingAssignments/CSEN 703').set('auth_token', token);
        console.log(res.body);
        expect(200);
        expect(res.body).toHaveLength(n);
    })
})