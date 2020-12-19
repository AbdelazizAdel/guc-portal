const memberModel = require('../../server/models/StaffMember');
const courseModel =  require('../../server/models/Course.js');
const slotModel = require('../../server/models/Slot.js');
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
function createStaffMember( id,email,password,name,gender,salary,dayOff,officeLoc,leaves,attendance,startDay,loggedIn,notifications,firstLogin,department)
{
    const member = new memberModel({
        id : id,
        email : email,
        password: password,
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
    return member;
}
module.exports = {
    createCourse,createSlot,createStaffMember
};