const memberModel = require('./models/StaffMember.js');
const departmentModel = require('./models/Department.js');
const CourseModel = require('./models/Course.js');
const requestModel = require('./models/Request.js');
const slotModel = require('./models/Slot');

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

async function createHR() {
    const member = new memberModel({
        id : 'hr-1',
        password: 'kcsckcsk',
        email : 'ashraf.mansour@guc.edu.eg',
        loggedIn : false,
        dayOff : 6
    });
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(member.password, salt);
    member.password = hashedPass;

    await member.save();
}

async function createDepartment() {
    const member = new memberModel({
        id : 'ac-1',
        password: 'kcsckcsk',
        email : 'slim.abdelnadeer@guc.edu.eg',
        loggedIn : false,
        dayOff : 4
    });
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(member.password, salt);
    member.password = hashedPass;

    await member.save();

    const department = new departmentModel({
        id: 'd-1',
        name: 'Computer Science',
        HOD: 'ac-1'
    })

    await department.save();

    let course1 = {id: 'CSEN 701', name: 'Embedded systems'};
    let course2 = {id: 'CSEN 702', name: 'Microprocessors'};
    let course3 = {id: 'CSEN 703', name: 'Analysis and design of algorithms'};    
    let course4 = {id: 'CSEN 704', name: 'Advanced computer lab'};    

    let courses = [];
    courses.push(course1);
    courses.push(course2);
    courses.push(course3);
    courses.push(course4);

    for(course of courses){
        createCourse(course.id, course.name);
    }
}

async function createCourse(courseId, courseName){
    const courseA = new CourseModel({
        id: courseId,
        name: courseName,
        mainDepartment : 'd-1',
        TAs: ['ac-2'],
        instructors: ['ac-3', 'ac-4'],
        numSlots: 20
    });
    
    await courseA.save();
}
const staffNames = ['Mahmoud Reda', 'Ali Osama', 'Yasmine Ahmed', 'Mohamed Youssef', 'Ziad Tamer', 'Mazen Ashraf']
const emails = ['mahmoud.reda', 'ali.osama', 'yasmine.ahmed', 'mohamed.youssef', 'ziad.tamer', 'mazen.ashraf']
async function createStaffMembers(){
    let staff = [];
    for(let i=2;i<8;i++){
        const memberA = new memberModel({
            id: 'ac-'+i,
            email: `${emails[i%6]}@guc.edu.eg`,
            password: 'kcsckcsk',
            loggedIn : false,                
            name: staffNames[i%6],
            department: 'd-1',
            dayOff: i%7
        });

        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(memberA.password, salt);
        memberA.password = hashedPass;
    
        staff.push(memberA);
        await memberA.save();
    }
    return staff;
}

async function createRequests() {
    const req = new requestModel({
        id: 'req-1',
        sender: 'ac-2',
        receiver: 'ac-1',
        status: 'Pending',
        content: 'day off',
        type: "AnnualLeave",
        duration: 5,
        startDate: new Date()
    }) 
    await req.save();
    const req2 = new requestModel({
        id: 'req-2',
        sender: 'ac-4',
        receiver: 'ac-1',
        status: 'Pending',
        content: 'day off',
        type: "SickLeave"
    }) 
    await req2.save();
    const req3 = new requestModel({
        id: 'req-3',
        sender: 'ac-3',
        receiver: 'ac-1',
        status: 'Pending',
        content: 'day off',
        type: "DayOff",
        startDate: new Date(),
        dayOff : 5
    }) 
    await req3.save();

}

async function createSlots() {
    for(let i=2;i<18;i++){
        const slot = new slotModel({
            id: 'slot-'+i,
            day: i%7,
            period: i%5,
            location: `C${i%7}-${i}07`,
            course: `CSEN 70${(i%4)+1}`,
            instructor: `ac-${(i%6)+2}`
        });
        await slot.save();
        const slot2 = new slotModel({
            id: 'slot-'+(i+18),
            day: i%7,
            period: i%5,
            location: `C${i%7}-${i}07`,
            course: `CSEN 70${(i%4)+1}`,
            instructor: `ac-${(i%6)+1}`
        });
        await slot2.save();

    }
}
mongoose.connect(process.env.DB_URL_Test, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
}).then(async() => {
    console.log('Main database connected successfully');
    await createHR();
    await createDepartment();
    await createStaffMembers();
    await createRequests();
    await createSlots();
});

