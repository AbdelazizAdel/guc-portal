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
### 4.3 Course Coordinator Functionalities
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