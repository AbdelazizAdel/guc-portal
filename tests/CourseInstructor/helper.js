const memberModel = require('../../server/models/StaffMember');
const courseModel =  require('../../server/models/Course.js');
const slotModel = require('../../server/models/Slot.js');
const departmentModel = require('../../server/models/Department.js');
const facultyModel = require('../../server/models/Faculty.js');
const bcrypt = require('bcrypt');
function createCourse(courseId,name,coordinator,tas,instructors,slots,mainDepartment,teachingDepartments){
    const course = new courseModel({
        id:courseId,
        name:name,
        coordinator:coordinator,
        TAs:tas,
        instructors:instructors,
        numSlots:slots,
        mainDepartment:mainDepartment,
        teachingDepartments:teachingDepartments
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
function createDepartment(id,name,HOD){
    const department = new departmentModel({
        id:id,
        name:name,
        HOD:HOD
    });
    return department;
}
function createFaculty(id,name,departments){
    const faculty = new facultyModel({
        id:id,
        name:name,
        departments:departments
    });
    return faculty;
}
async function createStaffMember( id,email,password,name,gender,salary,dayOff,officeLoc,leaves,attendance,startDay,loggedIn,notifications,firstLogin,department)
{
    const salt = await bcrypt.genSalt();
    const pass = await bcrypt.hash(password,salt);
    const member = new memberModel({
        id : id,
        email : email,
        password: pass,
        name:name,
        gender:gender,
        salary:salary,
        dayOff:dayOff,
        officeLoc:officeLoc,
        leaves:leaves,
        attendance:attendance,
        startDay:startDay,
        loggedIn : loggedIn,
        notifications:notifications,
        firstLogin:firstLogin,
        department : department
    });
    await member.save();
    return member;
}
module.exports = {
    createCourse,createSlot,createStaffMember,createDepartment,createFaculty
};