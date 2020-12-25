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
***
### 3.2 Course Instructor Functionalities
* #### View the coverage of course(s) he/she is assigned to.
    * Functionality : view the percentage of slots assigned to academic members relative to the total number of slots.
    * Route : ```/instructors/:instructorId/coverage```
    * Request type : **GET**
    * Response : an object containing attributes the courses this instructor is assigned to as the key and the percentage is given as the value.
    * Example:
    ```json
    {
        "Advanced Computer Lab":50,
        "Software Engineering":25
    }
    ```
***
* #### View the slots' assignment of course(s) he/she is assigned to.
    * Routes:
        * 1st route name : ```instructors/courses```
            * Functionality : returns the Ids and Names for the courses this instructor is responsible for
            * Request type : **GET**
            * Response : an array of objects where each object has 2 attributes courseId and course name which indicates the courses this instructor was originally assigned to.
            * Example:
            ```json
            {
                "courses":[{"courseId":"course1","courseName":"Advanced Computer Lab"}]
            }
            ```
            ***
        * 2nd route name : ```/courses/:courseId/slots-assignment```
            * Functionality : returns Information about all the slots for this course 
            * Request type : **GET**
            * Parameters : courseId refers to the course that is intended to view its slots
            * Response : an array of information of all slots given in this course
            * Example :
            ```json
            { 
            "slotsInformation" : 
                [   {"slotDay":1,
                     "slotPeriod" : 4,
                     "slotLocation" : "C7.305",
                     "instructor" : "Not Assigned yet",
                     "course" : "Advanced Computer Lab"
                    },
                    {"slotDay":3,
                     "slotPeriod" : 2,
                     "slotLocation" : "C7.301",
                     "instructor" : "Mohammed Ashry",
                     "course" : "Advanced Computer Lab"
                    }
                ]
            }
            ```
***
* #### View all the staff in his/her department along with their profiles
    * Routes:
        * 1st route name : ```/staff-members/department```
            * Funcitionality : return all the members' names and Ids in the same deparment as the instructor
            * Request type : **GET**
            * Response : an array of objects where each object consists of memberId and memberName referring to the staff members' ids and names in that department
            * Example :
            ```json
             {
                 "staffMembers":[
                    {"memberId" : "value1", "memberName" : "Mohammed Ashry"},
                    {"memberId" : "value2", "memberName" : "Noura Sadek"}
                    ]
             }
            ```
            ***
        * 2nd route name : ```/staff-members/department/:staffMemberId```
            * Functionality : return information about a specific academic member in the instructor's department
            * Request type : **GET**
            * Parameters : staffMemberId refers to the id of the academic member that the instructor wants to view their information
            * Response : An object containing information about the academic member
            * Example :
            ```json
             {
                "memberName" : "Mohammed Ashry",
                "memberEmail" : "anything@example.com",
                "memberGender" : "male",
                "memberDayoff": 2,
                "memberOfficeLoc" : "C7.305",
                "memberDepartment" : "value1"
            }
            ```
***
* ####  View all the staff in his/her courses along with their profiles
    * Routes:
        * 1st route name: ```/staff-members/courses```
            * Functionality : returns per course that the instructor is assigned for all the academic members names and ids that teach these course
            * Request type : **GET**
            * Response : multiple of objects where each object carries information about a different course whether this course has teaching assistants assigned to it or not,and the  Ids and names of all instructors and teaching assistants in this course
            * Example :
            ```json 
            {
                "Advanced Computer Lab" :
                    { 
                      "TAsAssigned" : true,
                      "TAs":[
                         {"id":"value1","name": "Mohammed Ashry"},
                         {"id":"value2","name": "Nora Sadek"}
                            ],
                      "instructors":[
                         {"id":"value3", "name" : "Mervat AbuElkheir"}
                        ]
                     }
            }
            ```
            ***
        * 2nd route name: ```/instructors/staff-members/:staffMemberId```
            * Functionality : return information about a specific academic member in one of the instructor's courses
            * Request type : **GET**
            * Parameters : staffMemberId refers to the id of the academic member that the instructor wants to view their information 
            * Response : An object containing information about the academic member
            * Example : 
            ```json 
            {
            "memberName" : "Mohammed Ashry", 
            "memberEmail" : "anything@example.com",
            "memberGender" : "male",
            "memberDayoff": 2,
            "memberOfficeLoc" : "C7.305",
            "memberDepartment" : "value1"
            }
            ```
***
* #### Assign an academic member to an unassigned slots in course(s) he/she is assigned to.
    * Routes: 
        * 1st route name: ``/instructors/courses/:courseid/unassigned-slots``
            * Functionality : returns all the unassigned slots as well as the course instructors and teaching assistants of a specific course
            * Request type : **GET**
            * Parameters : courseId refers to the id of the course that the latter instructor is assigned to
            * Response : An object containing an array of slots , as well as an array of teaching assistants and an array of instructors
            *Example:
            ```json
            {
                "unAssignedSlots":[
                    {
                        "id" : "slot1",
                        "day" : 3,
                        "period" : 4,
                        "location" : "C6.205",
                        "slotType" : "Lab",
                        "course" : "Advanced Computer Lab"
                    }
                ],
                "courseTAs" : [
                    "id1","id3","id7"
                ],
                "instructors":[
                    "id2","id4"
                ]

            }
            ```
        ***
        * 2nd route name: ```/academic-members/:memberId/slots/:slotId```
            * Functionality : assign an academic member to a slot 
            * Request type : **PATCH**
            * Parameters :
                * memberId refers to the (instructor/TA) that will be assigned to the slot
                * slotId refers to the slot that will be assigned
            * Request body :
                ```json
                {
                    "courseId" : "value1"
                }
                ```
            * Response : a text saying that the assigning was successful
***
* #### Update assignment of academic member in course(s) he/she is assigned to
    * Route : ```/academic-members/:memberId/slots/:slotId```
    * Functionality : assign an academic member to a slot 
    * Request type : **PATCH**
    * Parameters :
        * memberId refers to the (instructor/TA) that will be assigned to the slot
        * slotId refers to the slot that will be assigned
    * Request body :
        ```json
                {
                    "courseId" : "value1"
                }
        ```
    * Response : a text saying that the assigning was successful
***
* #### Delete assignment of academic member in course(s) he/she is assigned to
    * Route : ```/instructors/slots/:slotId```
    * Functionality : deleting assignment of academic members to a slot
    * Request type : **PATCH**
    * Parameters : slotId refers to the slot that will be changed

    * Request body :
        ```json
        {"courseId" : "value1"}
        ```
    * Response : a text saying that the update was successful
***
* #### Assign an academic member in each of his/her course(s) to be a course coordinator.
    * Route : ```/instructors/courses/:courseId/coordinator/:memberId```
    * Functionality : assigns a TA as a course coordinator
    * Request type : **PATCH**
    * Parameters :
        * courseId refers to the course which will be assigned a coordinator
        * memberId refers to the TA that will be assigned as a coordinator
    * Response : A text saying that the assigning was successful
***
### 3.3 Course Coordinator Functionalities
* #### View "slot linking" request(s) from academic members linked to his/her course
    * Routes :
        * 1st route name : ```/coordinator/courses```
        * Functionality : returns the ids and names of all the courses this member is a coordinator of
        * Request type : **GET**
        * Response: An array of objects where each object has courseId and courseName
        * Example
        ```json
        {
            "courses":[
                {"courseId":"value1","courseName":"Advanced Computer Lab"},
                {"courseId":"value2","courseName":"Software Engineering"}
            ]
        }
        ```
        * 2nd route name : ```/coordinator/courses/:courseId/slot-linking-requests```
        * Functionality : returns all slot linking requests for a specific course
        * Request type : **GET**
        * Parameters : courseId refers to the course the coordinator is viewing its requests
        * Response : An array of objects where each object has information about a single request*
        * Example :
        ```json
        {
            "slotRequests":[
                {
                    "requestId":"value1",
                    "memberId" : "value2",
                    "memberName" : "Mohammed Ashry",
                    "slotId" : "value3",
                    "slotDay":  3,
                    "slotPeriod" : 2,
                    "slotLocation" : "C5.204",
                    "content" : "I want this slot",
                    "submissionDate" : "2020-12-25T17:11:53.955+00:00"
                }
            ]
        }
        ``` 
***
* #### Accept/reject "slot linking" requests from academic members linked to his/her course.
    * Route : ```/coordinator/courses/:courseId```
    * Functionality : accept or reject a request and updates slots accordingly
    * Request type : **PATCH**
    * Parameters : courseId refers to the course the coordinator is updating its requests
    * Request Body:
    ```json
    {
        "requestId" : "value1",
        "requestResponse" : "Accepted"
    }
    ```
    * Response : a text indicating the success of accepting or rejecting requests
