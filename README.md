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
	* Request body :{
    "email": "anything@example.com",
    "password": "password"
}
	* Response : Text indicating whether the user logged in successfully or not

### 4.2 Course Instructor Functionalities
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
        * 1st route name : ```instructors/:id/courses```
            * Functionality : returns the Ids and Names for the courses  this instructor is responsible for
            * Request type : **GET**
            * Parameters : id refers to the instructor's Id
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
            * Request body : { "instructorId" : "value"}. 
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
        * 1st route name : ```/staff-members/:instructorId/department```
            * Funcitionality : return all the members' names and Ids in the same deparment as the instructor
            * Request type : **GET**
            * Parameters : instructorId refers to an instructor of some course.
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
        * 2nd route name : ```/staff-members/:instructorId/department/:staffMemberId```
            * Functionality : return information about a specific academic member in the instructor's department
            * Request type : **GET**
            * Parameters :
                * instructorId refers to the id of an instructor of some course
                * staffMemberId refers to the id of the academic member that the instructor wants to view their information
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
        * 1st route name: ```/staff-members/:instructorId/courses```
            * Functionality : returns per course that the instructor is assigned for all the academic members names and ids that teach these course
            * Request type : **GET**
            * Parameters : instructorId refers to the id of an instructor of some courses
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
        * 2nd route name: ```/instructors/:instructorId/staff-members/:staffMemberId```
            * Functionality : return information about a specific academic member in one of the instructor's courses
            * Request type : **GET**
            * Parameters :
                * instructorId refers to the id of an instructor of some course
                * staffMemberId refers to the id of the academic member that the instructor wants to view their information 
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
        * 1st route name: ``/instructors/:instructorId/courses/:courseid/unassigned-slots``
            * Functionality : returns all the unassigned slots as well as the course instructors and teaching assistants of a specific course
            * Request type : **GET**
            * Parameters :
                * instructorId  refers to the id of an instructor of a specific course
                * courseId refers to the id of the course that the latter instructor is assigned to
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
                    "instructorId" : "value1",
                    "courseId" : "value1"
                }
                ```
            * Response : a text saying that the assigning was successful
***

