const express = require('express');
const app = express();


app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
//middleware for using the Course Instructor routes
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
const courseCoordinatorRoutes = require('./routes/CourseCoordinatorRoutes.js');
app.use(generalRoutes);
app.use(courseInstructorRoutes);
app.use(courseCoordinatorRoutes);

const HOD = require('./routes/HOD_Route.js');
app.use('/HOD', HOD);

const HR = require('./routes/HR.js');
app.use('/HR', HR);

module.exports.app = app;