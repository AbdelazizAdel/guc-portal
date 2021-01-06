const express = require('express');
const cors = require('cors');
const generalRoutes = require('./routes/general.js');
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
const academicMemberFunctionalitiesRoute = require('./routes/academic_member_functionalities');
const HRRoutes = require('./routes/HRRoutes.js');
const courseCoordinatorRoutes = require('./routes/CourseCoordinatorRoutes.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(generalRoutes);
app.use(HRRoutes);
app.use(courseInstructorRoutes);
app.use(courseCoordinatorRoutes);
app.use(academicMemberFunctionalitiesRoute);

module.exports.app = app;