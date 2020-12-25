# guc-portal

## Team Members

* Abdelaziz Adel

* Ahmed Abdulkareem

* Mahmoud Reda

* Mazen Ashraf

* Ziad Tamer

  

## Start file

server/index.js

  

## port

3000


## Routes

### 1. GUC Staf Members Functionalities :

* ####  Log in with a unique email and a password.

	* Functionality : logging in with email and password
	* Route : /login
	* Request type : POST
	* Request body :{"email" : "anything@example.com", "password" : "password"}
	* Response : Text indicating whether the user logged in successfully or not
***
* #### Log out from the system.
	* Functionality : logging out from the system
	* Route : /logout
	* Request type : GET
	* Response : Text indicating that the user has logged out successfully
***
* #### View their profile.

	* Functionality : viewing profile information
	* Route : /profile
	* Request type : GET
	* Response : Staff member object. Example of staff member object : 
{"id": "ac-1",
  "name": "Ahmed",
  "email": "anything@example.com",
  "gender": "male",
  "salary": 15000,
  "dayOff": 5,
  "leaves": 4,
  "password": "anything",
  "officeLoc": "c6.303" }
***
* #### Update their profile except for the id and the name. Academic members can't update their salary, faculty and department.
	* Functionality : updating profile information
	* Route : /updateProfile
	* Request type : POST
	* Request body : 
	{"email": "anything@example.com",
  "gender": "female" }
	 * Response : Text indicating whether the profile was updated successfully or not.
***
* #### Reset their passwords.
	* Functionality : change password
	* Route : /changePassword
	* Request type : POST
	* Request body :
	* { "oldPass": "old",
  "newPass": "new" }
	* Response : Text indicating whether tha password was changed successfully or not
***
* #### Sign in. This should simulate a staff signing in(entering the campus).
	* Functionality : signing in the user
	* Route : /signin
	* Type : GET
	* Response : Text indicating that the user has signed in successfully
***
* #### Sign out. This should simulate a staff signing out(leaving the campus).
	* Functionality : signing out the user
	* Route : /signout
	* Type : GET
	* Response : Text indicating that the user has signed out successfully
***
* #### View all their attendance records, or they can specify exactly which month to view.
	* Functionality : viewing all attendance records
	* Route : /attendance
	* Type : GET
	* Response : Array of attendance objects. Example attendance object :
	{ "signIn": "2020-12-25T12:52:51.344Z",
  "SignOut": "2020-11-25T12:52:51.344Z" } 
  ***
  	* Functionality : viewing all attendance records in a specific month
	* Route : /attendance/:year/:month
	* Type : GET
	* Response : Array of attendance objects. Example attendance object :
	{ "signIn": "2020-12-25T12:52:51.344Z",
  "SignOut": "2020-11-25T12:52:51.344Z" } 
 ***
 * #### View if they have missing days. Missing days are days where the staff member don't have any attendance record, is not a Friday nor his/her day off, and there is no accepted leave for this day.
 
	 * Functionality : viewing missing days
	 * Route : /missingDays
	 * Type : GET
	 * Response : Array of Dates. Example :
	 [ "2020-12-25T12:52:51.344Z",
  "2020-11-25T12:52:51.344Z" ]
  ***
  * #### View if they are having missing hours or extra hours.
	* Functionality : viewing missing hours
	 * Route : /missingHours
	 * Type : GET
	 * Response : missing hours object. Example : { "missingHours": 12 }
***
<<<<<<< HEAD
* ####  Add/update/delete course slot(s) in his/her course.
* 
	* Functionality : course coordinator add a slot to his/her course
	* Route : /slot/add
	* Request type : POST
	* Request body :{"course" : "1234", 'instructor' : '4584205', ''day': 3,
            'period': 2,
            'location': 'ay 7aga',
            'slotType': 'compensation'}
    * Response : Text indicating whether the slot was added successfully or not.
    * **
    * Functionality : course coordinator delete a slot to his/her course
	* Route : /slot/delete
	* Request type : DELETE
	* Request body :{"slot" : "1234"}
    * Response : Text indicating whether the slot was deleted successfully or not.
    * **
    * Functionality : course coordinator update a slot to his/her course
	* Route : /slot/update
	* Request type : POST
	* Request body :{
        id: 1234,
        day: 5,
        period: 2,
        location: 'D4.101',
        slotType: 'Compensation',
        course: 'CSEN501',
        instructor: 'AY 7AD'
    }
    * Response : Text indicating whether the slot was updated successfully or not.
***
### 5. Academic Members Functionalities :

* ####  View their schedule.
* 
	* Functionality : View their schedule. Schedule should show teaching activities and replacements if present.
	* Route : /schedule
	* Request type : GET
	* Request body :{"id" : "1234"}
    * Response : Array of slot objects : [{
        id: 1234,
        day: 5,
        period: 2,
        location: 'D4.101',
        slotType: 'Compensation',
        course: 'CSEN501',
        instructor: 'AY 7AD'
    }]
***
* #### Send replacement request
	* Functionality : Send/view \replacement" request(s).
	* Route : /replacement/request
	* Request type : POST
	* Request body :{"id" : "1234", 'courseId' : '1234', 'receiver' : '4321', 'startDate' : '2020-12-28T00:57:38.662+00:00', 'slot' : '4', 'content' : 'hello there', 'duration' : 5, 'attachmentURL' : 'https://www.drivelink.com'}
	* Response : Text indicating whether the request was made successfully or not.
***
* #### Send a \slot linking" request (automatically sent to course coordinator). A "slot linking" request is a request done by the academic member to indicate their desire to teach a slot.
	* Functionality : send slot linking request
	* Route : /slotlinking/request
	* Request type : POST
	* Request body :{"id" : "1234", 'courseId' : '1234', 'startDate' : '2020-12-28T00:57:38.662+00:00', 'slot' : '4', 'content' : 'hello there', 'duration' : 5, 'attachmentURL' : 'https://www.drivelink.com'}
	* Response : Text indicating whether the request was made successfully or not.
***
* #### Change their day off by sending a "change day off" request (automatically sent to HOD),and optionally leave a reason.
	* Functionality : send change day off request
	* Route : /changedayoff/request
	* Request type : POST
	* Request body :{"id" : "1234", 'content' : 'hello there', 'dayOff' : '5'}
	* Response : Text indicating whether the request was made successfully or not.
***
* #### Submit any type of \leave" request (automatically sent to HOD). \Compensation" leave must have a reason. For any other leave, academic members can optionally write a brief reason behind it. Accepted leaves are not calculated as missing hours or missing days.
	* Functionality : send leave request
	* Route : /leave/request
	* Request type : POST
	* Request body :{"id" : "1234", 'receiver' : '4321', 'courseId' : '1234', 'startDate' : '2020-12-28T00:57:38.662+00:00', 'slot' : '4', 'content' : 'hello there', 'duration' : 5, 'attachmentURL' : 'https://www.drivelink.com', 'dayOff' : '2020-12-30T00:57:38.662+00:00'}
	* Response : Text indicating whether the request was made successfully or not.
***
* #### Cancel a still pending request or a request whose day is yet to come.
	* Functionality : cancel pending request
	* Route : /request/:requestID
	* Request type : DELETE
	* Request body :{"id" : "1234", 'requestID' : '54325'}
	* Response : Text indicating whether the request was made successfully or not.
***
* #### View the status of all submitted requests. They can also view only the accepted requests, only the pending requests or only the rejected requests.
	* Functionality : view requests
	* Route : /submittedRequests
	* Request type : GET
	* Request body :{"id" : "1234", 'status' : 'Accepted'}
	* Response : Text indicating whether the request was made successfully or not.
***
=======
### 2. HR Functionalities
* ####  Add Update or Delete a Location

	* Functionality : Update a Location 
	* Route : /opLocation/:id
	* Request type : POST
	* Request body :{"name" : "foo", "capacity" : 4}
	* Response : Text indicating whether the Location updated or Not
    ***
 
    * Functionality : Delete a Location 
	* Route : /opLocation/:id
	* Request type : Delete
	* Request body :{}
	* Response : Text indicating whether the Location was Deleted or Not
    ***

    * Functionality : Add a Location 
	* Route : /addLocation
	* Request type : POST
	* Request body : {"name": "c7.201", "capacity": 44, "type": "Tutorial room" }
	* Response : Text indicating whether the Location was Added or Not
***

* ####  Add Update or Delete a Faculty

    * Functionality : Update a Faculty 
	* Route : /opFaculty/:id
	* Request type : POST
	* Request body : {name: "Engineering Sciences"}
	* Response : Text indicating whether the Faculty was updated or Not
	***
    * Functionality : Delete a Faculty 
	* Route : /opLocation/:id
	* Request type : Delete
	* Request body : {}
	* Response : Text indicating whether the Faculty was deleted or Not
	***
    * Functionality : Add a Faculty 
	* Route : /addFaculty
	* Request type : POST
	* Request body : {name: "Engineering", departments:[]}
	* Response : Text indicating whether the Faculty is Added or Not
***
* ####  Add Update or Delete a Department under a Faculty
    * Functionality : Update a Department 
	* Route : /opDepartment/:id
	* Request type : POST
	* Request body : {facultyId:"f1", name: "Electronics Engineering Sciences"}
	* Response : Text indicating whether the Department was Updated or Not
	***
    * Functionality : Delete a Department 
	* Route : /opDepartment/:id
	* Request type : Delete
	* Request body : {}
	* Response : Text indicating whether the Department was Deleted or Not
	***
    * Functionality : Add a Department 
	* Route : /addDepartment
	* Request type : POST
	* Request body : {facultyId:"f1", name:"CSEN", HOD:"Foobar" }
	* Response : Text indicating whether the Department was added or Not
***
* ### Add Update or Delete Course under a Department 

    * Functionality : Update a Course
	* Route : /opCourse/:id
	* Request type : POST
	* Request body : {numSlots: 52}
	* Response : Text indicating whether the Course was updated or Not
	***
    * Functionality : Delete a Course 
	* Route : /opCourse/:id
	* Request type : Delete
	* Request body : {}
	* Response : Text indicating whether the Course was Deleted or Not
	***
    * Functionality : Add a Course 
	* Route : /addCourse
	* Request type : POST
	* Request body : {name: "Intro to CS",  coordinator: "FooBar",   TAs:[],  instructors:[], numSlots: 57 , mainDepartment: "dp51" ,  teachingDepartments : []}
	* Response : Text indicating whether the Course was added or Not
***
* ### HR can add Staff Members 
    * Functionality : Add a Staff Member
	* Route : /addMember
	* Request type : POST
	* Request body : {
                        email: foo@bar.com,
                        name: John Appleseed,
                        gender: Male,
                        salary:body.salary,
                        dayOff: Monday,
                        officeLoc: c7.01,
                        leaves: 0,
                        attendance:[],
                        startDay: 1970 00:00:00 UTC,    
                        loggedIn: false, 
                        notifications : [],
                        firstLogin : 1970 04:00:00 UTC,
                        department : "CSEN"
                       }
	* Response : Text indicating whether the Member was Added or Not
***

* ### Update or Delete Already Existing Staff Members
 	
    * Functionality : Update a Staff Member 
	* Route : /opStaffMemeber/:id
	* Request type : POST
	* Request body : {officeLoc: "c34.176"}
	* Response : Text indicating whether the Member was Updated or Not
	
    ***
    * Functionality : Delete a Staff Member 
	* Route : /opStaffMemeber/:id
	* Request type : DELETE
	* Request body : {}
	* Response : Text indicating whether the Member was Deleted or Not
***

* ### Add Missing Sign In/Out Records

    * Functionality : Add Sign In 
	* Route : /addSignIn/:id 
	* Request type : POST
	* Request body : {signIn:"UTC 19:00:00"}
	* Response : Text indicating whether the Record was Added or Not
	
    ***
    
     * Functionality : Add Sign Out
	* Route : /addSignOut/:id 
	* Request type : POST
	* Request body : {signOut:"UTC 19:00:00"}
	* Response : Text indicating whether the Record was Added or Not
	
	***
    * Functionality : Add Attendance Record 
	* Route : /addAttendance/:id
	* Request type : POST
	* Request body : {{signIn:"UTC 19:00:00"}, {signIn:"UTC 22:00:00"}}
	* Response : Text indicating whether the Record was Added or Not
    



    
>>>>>>> 76a1e9e95f95a8a6f04f70d92363f6230ed971d4
