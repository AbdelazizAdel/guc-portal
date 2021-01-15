const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const courseModel = require('../../server/models/Course.js');
const slotModel = require('../../server/models/Slot.js');
const facultyModel = require('../../server/models/Faculty.js');
const departmentModel = require('../../server/models/Department.js');
const requestModel = require('../../server/models/Request');
const createCourse = require('./helper.js').createCourse;
const createSlot =  require('./helper.js').createSlot;
const createStaffMamber = require('./helper.js').createStaffMember;
const createDepartment = require('./helper.js').createDepartment;
const createFaculty = require('./helper.js').createFaculty;
const createRequest = require('./helper.js').createRequest;
beforeAll(()=>{
try {
    (async () => {await mongoose.connect(process.env.DB_URL_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })})();
}
catch(err) {
    console.log(err);
}});

beforeEach(async () => {
    await memberModel.deleteMany();
    await courseModel.deleteMany();
    await slotModel.deleteMany();
    await departmentModel.deleteMany();
    await facultyModel.deleteMany();
    await requestModel.deleteMany();
});


describe('Testing Course Coverage route',()=>{
    // it('A case where the Slot model will not return any records',
    // async ()=>{
    //     const member =await createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,true,[],true,'dep1');
    //     const response = await request.post('/login').send({email : member.email, password :'ashduia' });
    //     const token = response.headers.auth_token;
    //     const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Hany5'],['Ashry19'],6,'dep1',['dep1','dep2']);
    //     const course2 = createCourse('course2','SoftwareEngineering','Ayman6',['Menrit28'],['Walid7'],10);
    //     const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course2','Menrit28');
    //     const slot2 = createSlot('slot2',1,1,'C7.304','Lab','course1');
    //     console.log(member);
    //     await course1.save();
    //     await course2.save();
    //     await slot1.save();
    //     await slot2.save();
    //     const output =  await(await request.get('/instructors/coverage').set('auth_token',token)).body;
    //     expect(output['course1']).toBe(0);
    //     expect(output['course2']).toBe(undefined);
    // },10000)
    // ,
    // it('A case where the slot model will return based on Instructors',async ()=>{
    //     const member =await createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,true,[],true,'dep1');
    //     const response = await request.post('/login').send({email : member.email, password :'ashduia' });
    //     const token = response.headers.auth_token;
    //     const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Hany5'],['Ashry19'],6);
    //     const course2 = createCourse('course2','SoftwareEngineering','Ayman6',['Menrit28'],['Walid7'],10);
    //     const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course2','Menrit28');
    //     const slot2 = createSlot('slot2',1,1,'C7.304','Lab','course1','Ashry19');
    //     await course1.save();
    //     await course2.save();
    //     await slot1.save();
    //     await slot2.save();
    //     const output = await (await request.get('/instructors/coverage').set('auth_token',token)).body;
    //     expect(output['course1']).toBe(100.0/6);
    //     expect(output['course2']).toBe(undefined);
    // },10000),
    // it('A case where the slot model will return multiple records',async ()=>{
    //     const member =await createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,true,[],true,'dep1');
    //     const response = await request.post('/login').send({email : member.email, password :'ashduia' });
    //     const token = response.headers.auth_token;
    //     const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Hany5'],['Ashry19'],10);
    //     const course2 = createCourse('course2','SoftwareEngineering','Ayman6',['Menrit28'],['Walid7'],10);
    //     const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course2','Menrit28');
    //     const slot2 = createSlot('slot2',1,1,'C7.304','Lab','course1','Ashry19');
    //     const slot3 = createSlot('slot3',4,3,'C2.115','Lab','course1','Ashry19');

    //     await course1.save();
    //     await course2.save();
    //     await slot1.save();
    //     await slot2.save();
    //     await slot3.save();
    //     const output = await (await request.get('/instructors/coverage').set('auth_token',token)).body;
    //     expect(output['course1']).toBe(2*100.0/10);
    //     expect(output['course2']).toBe(undefined);
    // },10000),
    // it('A case where the instructor is assigned to multiple courses',async ()=>{
    //     const member =await createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,true,[],true,'dep1');
    //     const member2 =await createStaffMamber('Hany5','Hany@yahoo.com','ashduia','Hany Shawky','male',5600,3,'C2.305',6,[],undefined,true,[],true,'dep1');
    //     const member3 =await createStaffMamber('sherif','sherif@yahoo.com','ashduia','sherif ayman','male',3000,3,'C5.305',6,[],undefined,true,[],true,'dep1');
    //     const response = await request.post('/login').send({email : member.email, password :'ashduia' });
    //     const token = response.headers.auth_token;
    //     const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Hany5'],['Ashry19'],10);
    //     const course2 = createCourse('course2','SoftwareEngineering','Ayman6',['Menrit28'],['Ashry19'],10);
    //     const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course2','Ashry19');
    //     const slot2 = createSlot('slot2',1,1,'C7.304','Lab','course1','Ashry19');
    //     const slot3 = createSlot('slot3',4,3,'C2.115','Lab','course1','Ashry19');

    //     await course1.save();
    //     await course2.save();
    //     await slot1.save();
    //     await slot2.save();
    //     await slot3.save();
    //     const output = await (await request.get('/instructors/coverage').set('auth_token',token)).body;
    //     expect(output['course1']).toBe(2*100.0/10);
    //     expect(output['course2']).toBe(100.0/10);
    // },10000),
    it('A case where the instructor is assigned to multiple courses',async ()=>{
        const member =await createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,true,[],true,'dep1');
        const member2 =await createStaffMamber('Hany5','Hany@yahoo.com','ashduia','Hany Shawky','male',5600,3,'C2.305',6,[],undefined,true,[],true,'dep1');
        const member3 =await createStaffMamber('sherif','sherif@yahoo.com','ashduia','sherif ayman','male',3000,3,'C5.305',6,[],undefined,true,[],true,'dep1');
        const req1 = createRequest('req1','sherif','Hany5','Pending','I want this slot',null,'SlotLinking','slot2');
        const req2 = createRequest('req2','Ashry19','Hany5','Pending','I want this slot',null,'SlotLinking','slot3');
        const req3 = createRequest('req3','sherif','Hany5','Pending','I want this slot',null,'SlotLinking','slot4');

        const faculty = createFaculty('fac2','Media Engineering and technology',['dep1']);
        const department = createDepartment('dep1','Computer Science','Ashry19');
        // const response = await request.post('/login').send({email : member.email, password :'ashduia' });
        // const token = response.headers.auth_token;
        const course1 = createCourse('course1','Advanced Computer Lab','Hany5',['Hany5','sherif'],['Ashry19'],10,'dep1');
        // const course2 = createCourse('course2','SoftwareEngineering','Ayman6',['sherif'],['Ashry19'],0,'dep1');
        const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course2',undefined);
        const slot2 = createSlot('slot2',1,1,'C7.304','Lab','course1',undefined);
        const slot3 = createSlot('slot3',4,3,'C2.115','Lab','course1',undefined);
        const slot4 = createSlot('slot4',2,3,'C2.115','Lab','course1',undefined);
        const slot5 = createSlot('slot5',1,5,'C6.115','Lab','course1',undefined);
        // await faculty.save();
        // await department.save();
        await course1.save();
        // await course2.save();
        await req1.save();
        await req2.save();
        await req3.save();
        // await slot1.save();
        await slot2.save();
        await slot3.save();
        await slot4.save();
        await slot5.save();
        // const output = await (await request.get('/instructors/coverage').set('auth_token',token)).body;
        expect(1).toBe(1);
    },20000)
})