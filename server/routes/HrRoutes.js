const express= require('express');
const router= express.Router();
const DepartmentModel = require('../models/Department.js');
const MemberModel = require('../models/StaffMember.js');
const RequestModel = require('../models/Request.js');
const SlotModel = require('../models/Slot.js');
const CourseModel = require('../models/Course.js');
const FacultyModel = require('../models/Faculty.js');
const LocationModel = require('../models/Location.js');
const metaData = require('../models/metaData');
const auth = require('../routes/middleware.js').authentication;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const memberModel = require('../models/StaffMember');
const requestModel = require('../models/Request');
const {authentication} = require('./middleware');
const superagent = require('superagent');
const StaffMember = require('../models/StaffMember');
const Joi = require('joi');
const day_ms = 86400000; // number of milliseconds in a day

router.use(express.json());
//router.use(auth)



//* Add Update or Delete a Location 
//* Update or delete
router.route("/opLocation/:id",auth)
.delete(async(req,res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
  
    LocationModel.findOneAndDelete({"id":id},req.params.id, (err,doc)=>{
        if(err) {
            
            res.status(400).send("Couldnt Find a Location");
            
            return}
        else{
            res.status(200).send("Deleted Successfully");

        }
    })

})
.post(async(req,res) =>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    var body = req.body
    try {
        LocationModel.findByOneAndUpdate({"id":id},req.params.id,req.body,(err,doc) =>{
            if(err) {
                res.status(400).send("Couldnt Add Location, try again !");
                return
            }
            else{
                res.status(200).send("Location Added Successfully");
            }
        })
    
        
    } catch (error) {
        res.status(400).send("Couldnt Add Location, Data is invalid !");
        
    }
})

router.route("/addLocation",auth)
.post(async(req,res) =>{

    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    var body = req.body
    try {
        const location  = new LocationModel({
            "name": body.name,
            "capacity": body.capacity,
            "type": body.type
        })
        location.save((err,doc)=>{
            if(err) {
            res.status(400).send("Couldnt Add Location, try again !");
            return
        }
        else{
            res.status(200).send("Location Added Successfully");
        }
        })
        
    } catch (error) {
        
    }
   
})

// * update or delete a Faculty
router.route("/opFaculty/:id",auth)
.delete(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    var FacultyID = req.body.id
    FacultyModel.findOneAndRemove({"id":id},req.params.id,(err,doc)=>{
        if(err){ 
            res.status(400).send("Error Deleting Faculty");
            return console.log(err);
        }
        console.log('Faculty  Deleted Successfully');
        res.status(200).send('Faculty Deleted Successfully'); 
    });
    })

.post(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
const faculty = new FacultyModel({
    "id": req.body.id,
    "name": req.body.name,
    "departments": req.body.departments
})

FacultyModel.findOneAndUpdate({"id":req.params.id},req.body,(err,doc)=>{
    if(err){ 
        res.status(400).send('Faculty failed to update');
         return console.log(err);}

    else{
            res.status(200).send('Faculty updated Successfully');
        }
    })
        })

// * Add a faculty
router.route("/addFaculty",auth)
.post(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
const body = req.body

const id = await metaData.find({"sequenceName": 'fa'})[0].lastId;
if(id === undefined){
    id = 1;
}
id++;
await metaData.updateOne({"sequenceName": 'fa'},{'lastId' : id});

const faculty = new FacultyModel({
    "id": id,
    "name": body.name,
    "departments": body.departments
})
faculty.save((err,doc) =>{
    if(err) {
        res.status(400).send("Failed to add Course")
        return
    }
    else{
        res.status(200).send("Addd Course Successfully")
    }

})
})

//* Add Delete Update a Department under a faculty

// * Add A Dept under a faculty 
router.route("/addDepartment",auth)
.post( async(req,res)=>{
    // Faculty ID
    // A course Object 

    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
    const body = req.body
    try {
        const id = await metaData.find({"sequenceName": 'dp'})[0].lastId;
        if(id === undefined){
            id = 1;
        }
        id++;
       await metaData.updateOne({"sequenceName": 'dp'},{'lastId' : id});
        const Dept = new DepartmentModel({
            "id": id,
            "name": body.name,
            "HOD": body.HOD
        });
        FacultyModel.find({"id":faculyId},(err,doc) => {
            if(err){
                res.status(400).send("Error Locating the department")
                return
            }
            else{
                Dept.save((err,doc) => {
                    if(err) return console.log(err);
                    console.log("Added Successfully");
                    res.status(200).send('Added');
                    doc.departments.push(course.id)
                }); 
            }
        })
    } catch (error) {
        res.status(400).send("Error in Input Data")
        return
    }
})
// * Delete Update a Department under a faculty
router.route("/opDepartment/:id",auth)
.post(
    
    async(req, res) =>{
        if(!isHR(req.body.member.id)){
            res.status(405).send("Error Invalid Credentials")
            return
        }
        DepartmentModel.findOneAndUpdate({"id":req.params.id},req.body,(err,doc)=>{
            if(err){ 
                res.status(400).send('Department failed to update');
                 return console.log(err);}
        
            else{
                    res.status(200).send('Department updated Successfully');
                }

        })
})
.delete(
    async(req, res) =>{
        if(!isHR(req.body.member.id)){
            res.status(405).send("Error Invalid Credentials")
            return
        }
        DepartmentModel.findOneAndDelete({"id":req.params.id},(err,doc) => {
            if (err){
                res.status(400).send("Failed to Delete Department")
                return
            }
            else{
                console.log('Department Deleted Successfully');
                res.status(200).send('Department Deleted Successfully');
            }
        })
    }
)

// * Add update or delete a course

router.route("/opCourse/:id",auth)
.delete(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
    CourseModel.findOneAndDelete({"id":req.params.id},(err,doc)=>{
        if(err) return console.log(err);
        console.log('Course Deleted Successfully');
        res.status(200).send('Course Deleted Successfully');  
    });
    })

.post(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
CourseModel.findOneAndUpdate({"id":req.params.id},req.body,(err,doc) => {
    if(err){
        res.status(400).send("Couldn't Update Course");
    }
    else{
        res.status(200).send("Updated Course Successfully");
    }
})
});
// * AddCourse
router.route("/addCourse",auth)
.post(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
    const id = await metaData.find({"sequenceName": 'co'})[0].lastId;
    if(id === undefined){
        id = 1;
    }
    id++;
   await metaData.updateOne({"sequenceName": 'co'},{'lastId' : id});

    const body = req.body
    const course = new CourseModel({
        "id":id,
        "name":body.name,
        "coordinator": req.body.coordinator,
        "TAs":body.TAs,
        "instructors":body.instructors,
        "numSlots": body.numSlots,
        "mainDepartment":body.mainDepartment,
        "teachingDepartments" : body.teachingDepartments
    }
    )
    course.save((err,doc) => {
        if(err){   
            res.status(400).send('Course Deleted Successfully');
            return console.log(err);}
        else
        { 
        console.log("Updated Successfully");
        res.status(200).send('Course updated Successfully');
        }
    
    })
})
//* Update / Delete Staff Members
router.route("/opStaffMemeber/:id",auth)
.post(async(req, res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    MemberModel.findOneAndUpdate({"id":req.params.id},req.body, (err,doc)=>{
        if(err){
            res.status(400).send("Error Updating Staff Member");
            return ;
        }
        else{
            res.status(200).send("Staff Memebr Updated Successfully")
        }
    })

})

.delete(async(req, res)=>{
    MemberModel.findOneAndDelete({"id":req.params.id},(err,doc)=>{
        if(err){
            res.status(400).send("Error Deleteing Staff Member! It might Not Exist");
            return ;
        }
        else{
            res.status(200).send("Staff Memebr Deleted Successfully")
        }
    })
}
)

// * Add a New Staff Member 
router.route("/addMember",auth)
.post(async(req,res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
   // ! Unique Emails

   // ! Unique IDs

   //! Default 123456 Password

   //! NO Full office Locations & NO COURSE ASSIGNMENT

   
  
   const body  = req.body
   if(body.officeLoc != undefined){

    LocationModel.findOne({"id":officeLoc},body.officeLoc, (err,doc)=>{
        var newCapacity = 0;
        if(err){
            res.status(400).send("Room Doesnt exist")
            return ;
        }
        
        else{
            if (doc.capacity > 0 && doc.type == "office"){
                try {
                    newCapacity = doc.capacity -- ;

                    const id = await metaData.find({"sequenceName": 'ac'})[0].lastId;
                    if(id === undefined){
                        id = 1;
                    }
                    id++;
                   await metaData.updateOne({"sequenceName": 'ac'},{'lastId' : id});
                    
                    const StaffMember = new StaffMemberSchema({
                        "id":id,
                        "email":body.email,
                        "name":body.id,
                        "gender":body.gender,
                        "salary":body.salary,
                        "dayOff": body.dayOff,
                        "officeLoc": Stribody.officeLocng,
                        "leaves": body.leaves, // indicates the number of leaves the staff member has taken
                        "attendance":body.attendance,
                        "startDay":body.startDay,    // The day on which the Staff member started his job at the University
                        "loggedIn": body.loggedIn, // determines if this user is logged in or not (has a valid token)
                        "notifications" : [],
                        "firstLogin" : body.firstLogin,
                        "department" : body.department
                       })
                
                       StaffMember.save((err,doc)=>{
                           if(err){
                               res.status(400).send("Error in Adding The Member")
                           }
                           else{
                            LocationModel.updateOne({"id":officeLoc},{"capacity":newCapacity},(err,doc)=>{
                                if(err){
                                    res.status(400).send("Error in Adding The Member")
                                }
                                else{
                                    res.status(200).send("Successfully Added The Member")
                                   }
                           })
                            
                           }
                       })
                       
                       
                       
                   } catch (error) {
                       res.status(400).send("Error In Data Form, please check again")
                   } 
            }

        }
    })
   }
}) 

router.route("/addSignIn/:id",auth)
.post(async(req,res)=>{
    // body{
// signInDate: Date
  //  }
  if(!isHR(req.body.member.id)){
    res.status(405).send("Error Invalid Credentials")
    return
}

  if(req.body.member.id == req.params.id){
    res.status(405).send("Error Invalid Credentials")
    return
}

  MemberModel.findOne({"id":req.params.id},(err,doc)=>{
      if(err){
          res.status(400).send("Error Finidng the Member")
          return
      }
      else{
        doc.attendance.push({
            signIn: req.body.signIn,
            signOut: undefined
           })
           doc.attendance.sort((a,b)=>{
              return a.signIn < a.signIn
           });
           res.status(200).send("Added SignIn Record")
      }
  }) 
})

router.route("/addSignOut/:id",auth)
.post(async(req,res)=>{
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    if(req.body.member.id == req.params.id){
        res.status(405).send("Error Invalid Credentials")
        return
    }

    MemberModel.findOne({"id":req.params.id},(err,doc)=>{
        if(err){
            res.status(400).send("Error Finidng the Member")
            return
        }
        else{
          doc.attendance.push({
              signIn: undefined,
              signOut: req.body.signOut       
             });

             doc.attendance.sort((a,b)=>{
                return a.signIn < a.signIn
             });
             res.status(200).send("Added SignIn Record")
        }
    })

})

router.route("/addAttendance/:id",auth)
.post(async(req,res)=>{
    // body{
// signInDate: Date
//Singout: Date
  //  }
    if(!isHR(req.body.member.id)){
        res.status(405).send("Error Invalid Credentials")
        return
    }
 
    if(req.body.member.id == req.params.id){
        res.status(405).send("Error Invalid Credentials")
        return
    }
  MemberModel.findOne({"id":req.params.id},(err,doc)=>{
      if(err){
          res.status(400).send("Error Finidng the Member")
          return
      }
      else{
        doc.attendance.push({
            signIn: req.body.signIn,
            signOut: req.body.signOut
           })
           doc.attendance.sort((a,b)=>{
              return a.signIn < a.signIn
           });
           res.status(200).send("Added SignIn Record")
      }
  }) 
})

function isHR(ID) {
    if(ID.includes("hr")){
        return true;
    }
    return false;
}

// function which checks for valid year
function isYearValid(year) {
    return /^\d{4}$/.test(year);
}

// function which checks for valid month
function isMonthValid(month) {
    return /^(0[0-9]|1[0-1])$/.test(month);
}

function isValidStaffId(id) {
    return new RegExp('ac-[1-9]\d*').test(id) || new RegExp('hr-[1-9]\d*').test(id);
}

function isValidHR(id) {
    return new RegExp('hr-[1-9]\d*').test(id);
}

router.get('/attendance/:year/:month/:staffId', [authentication], async(req, res)=>{
    if(!isValidHR(req.body.member.id))
        return res.send("Not allowed")
    let {year, month, staffId} = req.params;

    if(!isYearValid(year))
        return res.send('this is not a valid year');

    if(!isMonthValid(month))
        return res.send('this is not a valid month');


    if(!isValidStaffId(staffId)){
        return res.send('this is not a valid staffmember');
    }

    const{attendance} = await StaffMember.findOne({id: staffId});

    if(attendance == undefined)
        return res.send([]);

    year = Number(year);
    month = Number(month);
    let result = [];
    const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
    if(year === curYear && month === curMonth) {
        if(curDay >= 11) {
            const start = new Date(year, month, 11).getTime(), end = new Date(year, month, curDay).getTime() + day_ms - 1;
            result = attendance.filter((elem) => {
                const signIntime = elem.signIn === undefined ? -1 : elem.signIn.getTime();
                const signOutTime = elem.signOut === undefined ? -1 : elem.signOut.getTime();
                return (signIntime >= start && signIntime <= end) || (signOutTime >= start && signOutTime <= end); 
            });
        }
    }
    else if(year <= curYear && month <= curMonth) {
        const nextYear = month == 11 ? year + 1 : year;
        const nextMonth = month == 11 ? 0 : month + 1;
        const tenthDayNextMonth = new Date(nextYear, nextMonth, 10);
        let start = new Date(year, month, 11).getTime(), end;
        if(curDate.getTime() >= tenthDayNextMonth.getTime())
            end = tenthDayNextMonth.getTime() + day_ms - 1;
        else
            end = new Date(curYear, curMonth, curDay).getTime() + day_ms - 1;
        result = attendance.filter((elem) => {
            const signIntime = elem.signIn === undefined ? -1 : elem.signIn.getTime();
            const signOutTime = elem.signOut === undefined ? -1 : elem.signOut.getTime();
            return (signIntime >= start && signIntime <= end) || (signOutTime >= start && signOutTime <= end); 
        });
    }
    console.log(result)
    res.status(200).send(result);
})

// function for getting attendance records based on the current day
async function getAttendanceRecords(token, id) {
    const curDate = new Date(), curYear = curDate.getFullYear(), curMonth = curDate.getMonth(), curDay = curDate.getDate();
    let year, month;
    if(curDay >= 11) {
        year = curYear;
        month = curMonth;
    }
    else {
        year = curMonth == 0 ? curYear - 1 : curYear;
        month = curMonth == 0 ? 11 : curMonth - 1;
    }
    const response = await superagent.get(`http://localhost:3000/HR/attendance/${year}/${month}/${id}`).set('auth_token', token);
//    console.log(response.body)
    const records = response.body.map((elem) => {
            if(elem.signIn != undefined)
                elem.signIn = new Date(elem.signIn);
            if(elem.signOut != undefined)
                elem.signOut = new Date(elem.signOut);
            return elem;
    })
    return {
        records,
        startYear : year,
        startMonth : month
    };
}

// function for determining if the attendance record is valid or not
function isValidRecord(record) {
    const{signIn, signOut} = record;
    if(signIn == undefined || signOut == undefined)
        return false;
    const year = signIn.getFullYear(), month = signIn.getMonth(), day = signIn.getDate();
    const min = new Date(year, month, day, 7).getTime(), max = new Date(year, month, day, 19).getTime();
    if(signIn.getTime() > max || signOut.getTime() < min)
        return false;
    return true;
}

// function for determining the number of days passed in the current month (GUC month)
function numOfDays(startYear, startMonth) {
    const curDate = new Date(), curDay = curDate.getDate();
    let numDays;
    if(curDay >= 11)
        numDays = curDay - 11 + 1;
    else {
        const numDaysStartMonth = new Date(startYear, startMonth, 0).getDate();
        numDays = curDay + numDaysStartMonth - 11 + 1;
    }
    return numDays;
}

// function which creates an object of days given first day and the number of days
function createDays(firstDay, numDays) {
    let days = {};
    for(let i = 0; i < numDays; i++)
        days[String(firstDay + i * day_ms)] = true;
    return days;
}

async function missingDays(id, dayOff, token) {
    const {records, startYear, startMonth} = await getAttendanceRecords(token, id);
    const numDays = numOfDays(startYear, startMonth);
    const firstDay = new Date(startYear, startMonth, 11).getTime();
    let days = createDays(firstDay, numDays);
    for(let i = 0; i < records.length; i++) {
        if(!isValidRecord(records[i]))
            continue;
        const year = records[i].signIn.getFullYear(), month = records[i].signIn.getMonth(), day = records[i].signIn.getDate();
        days[String(new Date(year, month, day).getTime())] = false;
    }
    const requests = await requestModel.find({sender : id, status : 'Accepted'}).or([
        {type : 'AnnualLeave'}, {type : 'AccidentalLeave'}, {type : 'SickLeave'}, {type : 'MaternityLeave'}
    ]);
    const compensationLeaves = await requestModel.find({
        sender : id,
        status : 'Accepted',
        type : 'CompensationLeave',
        startDate : {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)},
        dayOff :  {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)}
    });
    for(let i = 0; i < compensationLeaves.length; i++) {
        const d = compensationLeaves[i].dayOff, s = compensationLeaves[i].startDate;
        if(!days[String(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())])
            days[String(new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime())] = false;
    }
    for(let i = 0; i < numDays; i++) {
        let date = new Date(firstDay + i * day_ms);
        if(date.getDay() == 5 || date.getDay() == dayOff)
            days[String(date.getTime())] = false;
        else {
            let acceptedRequests = requests.filter((elem) => {
                let low = elem.startDate.getTime();
                let offset = elem.duration == undefined ? 1 : elem.duration;
                let high = low + offset * day_ms;
                return date.getTime() >= low && date.getTime() < high;
            })
            if(acceptedRequests.length > 0)
                days[String(date.getTime())] = false;
        }
    }
    let result = [];
    for(let i = 0 ; i < numDays; i++) {
        let date = new Date(firstDay + i * day_ms);
        if(days[String(date.getTime())] == true)
            result[result.length] = date;
    }
    return result;
}
router.get('/StaffMembersWithMissingDays', [authentication], async(req, res)=>{
    if(!isValidHR(req.body.member.id))
        return res.send("Not allowed");

    let staff = await StaffMember.find();
    let missingDays_staff = [];
    for(member of staff){
        let days = await missingDays(member.id, member.dayOff, req.headers.auth_token);
        if(!days){
            continue;
        }else{
            missingDays_staff.push({id: member.id, name: member.name, missingDays: days});
        } 
    }
    res.status(200).send(missingDays_staff);
})

async function missingHours(id, dayOff, token) {
    const {records, startYear, startMonth} = await getAttendanceRecords(token, id);
    const numDays = numOfDays(startYear, startMonth);
    const firstDay = new Date(startYear, startMonth, 11).getTime();
    const days = createDays(firstDay, numDays);
    let result = 0, cnt = 0;
    for(let i = 0; i < records.length; i++) {
        if(!isValidRecord(records[i]) || records[i].signIn.getDay() == 5)
            continue;
        const{signIn, signOut} = records[i];
        const year = signIn.getFullYear(), month = signIn.getMonth(), day = signIn.getDate();
        const start = new Date(year, month, day, 7), end = new Date(year, month, day, 19);
        days[String(new Date(year, month, day).getTime())] = false;
        const signInTime = Math.max(start.getTime(), signIn.getTime());
        const signOutTime = Math.min(end.getTime(), signOut.getTime());
        const spentTime = (signOutTime - signInTime) / (1000 * 60 * 60);
        result-=spentTime;
    }
    const compensationLeaves = await requestModel.find({
        sender : id,
        status : 'Accepted',
        type : 'CompensationLeave',
        startDate : {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)},
        dayOff :  {$gte : new Date(firstDay), $lt : new Date(firstDay + numDays * day_ms)}
    });
    let compensatedDayOffs = {};
    for(let i = 0; i < compensationLeaves.length; i++) {
        const d = compensationLeaves[i].dayOff;
        compensatedDayOffs[String(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())] = true;
    }
    for(let i = 0; i < numDays; i++) {
        const d = new Date(firstDay + i * day_ms);
        if((d.getDay() == dayOff && compensatedDayOffs[String(d.getTime())] == true && !days[String(d.getTime())]) ||
         (d.getDay() != dayOff && d.getDay() != 5 && !days[String(d.getTime())]))
            cnt++;
    }
    result = result + cnt * 8.4;
    return result;
}
router.get('/StaffMembersWithMissingHours', [authentication], async(req, res)=>{
    if(!isValidHR(req.body.member.id))
        return res.send("Not allowed");

    let staff = await StaffMember.find();
    let missingHours_staff = [];
    for(member of staff){
        let hours = await missingHours(member.id, member.dayOff, req.headers.auth_token);
        console.log(hours);
        if(!hours){
            continue;
        }else{
            missingHours_staff.push({id: member.id, name: member.name, missingHours: hours});
        }
    }
    res.status(200).send(missingHours_staff);
})
router.put('/updateSalary', [authentication], async(req, res)=>{
    if(!isValidHR(req.body.member.id))
        return res.send("Not allowed");
    const schema = Joi.object({
        newSalary: Joi.number().required(),
        staffId: Joi.string().min(4).pattern(new RegExp('ac-[1-9]\d*'))
    })
    
    const{error, value} = schema.validate(req.body, {allowUnknown: true});
    if(!error){
        try{
            await StaffMember.findOneAndUpdate({id: value.id}, {salary: value.newSalary});
            res.status(200).send('Salary updated successfully');    
        }catch(e){
            res.status(404).send(e);
        }
    }else{
        res.status(403).send(error);
    }
})


module.exports = router;