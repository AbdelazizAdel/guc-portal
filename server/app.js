const express = require('express');
const app = express();

// middleware for transforming String into JSON
app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
app.use(generalRoutes);
//middleware for using the Course Instructor routes
const CourseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
app.use(CourseInstructorRoutes);
module.exports.app = app;