const app = require('../../server/app.js').app;
const supertest = require('supertest');
const request = supertest(app);
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const memberModel = require('../../server/models/StaffMember.js');
const courseModel = require('../../server/models/Course.js');
const slotModel = require('../../server/models/Slot.js');
const createCourse = require('./helper.js').createCourse;
const createSlot =  require('./helper.js').createSlot;
const createStaffMamber = require('./helper.js').createStaffMember;
beforeAll(()=>{
try {
    (async () => {await mongoose.connect(process.env.DB_URL, {
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
});
describe('Testing Assigning Slots route',()=>{
    it('A case where the member we are assigning doesn\'t exist in the database',
    async ()=>{
        const member = createStaffMamber('Ashry19','ashry@yahoo.com','ashduia','Mohammed Ashry','male',7000,3,'C6.305',6,[],undefined,false,[],true,'dep1');
        const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Hany5'],['Ashry19'],6,'dep1',['dep1','dep2']);
        const slot1 = createSlot('slot1',1,1,'C7.304','Lab','course1');
        await member.save();
        await course1.save();
        await slot1.save();        

        const output =  await(await request.patch('/academic-members/Nermeen2/slots/slot1').send({instructorId:'Ashry19',courseID:'course1'})).text;
        console.log(output);
        expect(output).toBe('The member you are trying to assign is not found!!');
    },10000)
    ,it('A case where the member trying to assign is not a course instructor',async ()=>{
        const member = createStaffMamber('Nermeen2','ashry@yahoo.com','ashduia','Nermeen Ashry','male',7000,3,'C6.305',6,[],undefined,false,[],true,'dep1');
        const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Ayman2'],['Hany5'],6);
        const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course1');
        await member.save();
        await course1.save();
        await slot1.save();
        const output =  await(await request.patch('/academic-members/Nermeen2/slots/slot1').send({instructorId:"Ashry19"  ,courseId:"course1"})).text;
        expect(output).toBe('You are not allowed to assign a slot to an academic member!!');
    },10000)
    ,it('A case where the member is not assigned to the course',async ()=>{
        const member = createStaffMamber('Nermeen2','ashry@yahoo.com','ashduia','Nermeen Ashry','male',7000,3,'C6.305',6,[],undefined,false,[],true,'dep1');
        const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Ayman2'],['Ashry19'],6);
        const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course1');
        await member.save();
        await course1.save();
        await slot1.save();
        const output =  await(await request.patch('/academic-members/Nermeen2/slots/slot1').send({instructorId:"Ashry19"  ,courseId:"course1"})).text;
        expect(output).toBe('This teaching assistant can\'t be assigned to this course');
    },10000),
    it('A case where the academic member is assigned to the slot',async ()=>{
        const member = createStaffMamber('Nermeen2','ashry@yahoo.com','ashduia','Nermeen Ashry','male',7000,3,'C6.305',6,[],undefined,false,[],true,'dep1');
        const course1 = createCourse('course1','Advanced Computer Lab','Mervat22',['Nermeen2'],['Ashry19'],6);
        const slot1 = createSlot('slot1',2,1,'C7.301','Lab','course1');
        await member.save();
        await course1.save();
        await slot1.save();
        const output =  await(await request.patch('/academic-members/Nermeen2/slots/slot1').send({instructorId:"Ashry19"  ,courseId:"course1"})).text;
        expect(output).toBe('The Slot was modified correctly');
        expect((await slotModel.findOne({'id':'slot1'})).instructor).toBe('Nermeen2');
    },10000)
})