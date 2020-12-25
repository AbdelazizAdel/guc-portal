const express = require('express');
const app = express();

// middleware for transforming String into JSON
app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
//middleware for using the Course Instructor routes
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
const HRRoutes = require('./routes/HRRoutes.js');
app.use(generalRoutes);
app.use(HRRoutes);
app.use(courseInstructorRoutes);


module.exports.app = app;