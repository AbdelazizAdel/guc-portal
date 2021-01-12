const express = require('express');
const cors = require('cors');
const generalRoutes = require('./routes/general.js');
const courseInstructorRoutes = require('./routes/CourseInstructorRoutes.js');
const academicMemberFunctionalitiesRoute = require('./routes/academic_member_functionalities');
const courseCoordinatorRoutes = require('./routes/CourseCoordinatorRoutes.js');
const HOD = require('./routes/HOD_Route.js');
const HR = require('./routes/HR.js');
const app = express();
const cors_config = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
    exposedHeaders : 'auth_token',
}

app.use(cors(cors_config));
app.use(express.json());
app.use(generalRoutes);
app.use(courseInstructorRoutes);
app.use(courseCoordinatorRoutes);
app.use(academicMemberFunctionalitiesRoute);
app.use('/HOD', HOD);
app.use('/HR', HR);

module.exports.app = app;