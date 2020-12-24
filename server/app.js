const express = require('express');
const app = express();


app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
//middleware for using the Course Instructor routes
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');

app.use(generalRoutes);
app.use(courseInstructorRoutes);

const HOD = require('./routes/HOD_Route');
app.use(HOD);

module.exports.app = app;