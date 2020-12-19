const memberModel = require('../server/models/StaffMember.js');
const courseModel =  require('../server/models/Course.js');
const slotModel = require('../server/models/Slot.js');
const app = require('../server/app.js').app;
const bcrypt = require('bcrypt');
const superagent = require('superagent');

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
function createCourse(courseId,name,coordinator,tas,instructors,slots){
    const course = new courseModel({
        id:courseId,
        name:name,
        coordinator:coordinator,
        TAs:tas,
        instructors:instructors,
        numSlots:slots
    });
    return course;
}

function createSlot(id,day,period,location,slotType,course,instructor){
    const slot = new slotModel({
        id:id,
        day:day,
        period:period,
        location:location,
        slotType:slotType,
        course:course,
        instructor:instructor
    });
    return slot;
}
function createStaffMember( id,email,password,name,gender,salary,dayOff,officeLoc,leaves,attendance,startDay,loggedIn)
{
    const member = new memberModel({
        id : id,
        password: password,
        email : email,
        name:name,
        gender:gender,
        salary:salary,
        dayOff:dayOff,
        officeLoc:officeLoc,
        leaves:leaves,
        attendance:attendance,
        startDay:startDay,
        loggedIn : loggedIn
    });
    return member;
}
module.exports = {
    createMember,createCourse,createSlot,createStaffMember
};