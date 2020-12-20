const express= require('express');
const router= express.Router();

const DepartmentModel = require('../models/Department.js');
const MemberModel = require('../models/Member.js');
const RequestModel = require('../models/Request.js');
const SlotModel = require('../models/Slot.js');
const AttendanceModel = require('../models/Attendance.js');