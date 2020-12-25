const express = require('express');
const app = express();


app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
//middleware for using the Course Instructor routes
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
//middleware for using the course coordinator routes
const courseCoordinatorRoutes = require('./routes/CourseCoordinatorRoutes.js');
//middleware for using the HOD routes
const HOD = require('./routes/HOD_Route.js');
//middleware for using the HR routes
const HR = require('./routes/HR.js');

app.use(generalRoutes);

app.use(courseInstructorRoutes);

app.use(courseCoordinatorRoutes);

app.use('/HOD', HOD);

app.use('/HR', HR);

module.exports.app = app;