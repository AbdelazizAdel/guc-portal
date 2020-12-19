const express = require('express');
const app = express();

<<<<<<< HEAD

app.use(express.json())
//const generalRoutes = require('./routes/general.js');
=======
// middleware for transforming String into JSON
app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
app.use(generalRoutes);
>>>>>>> ce103a1a3ecbfde7390243a7e110e59e2557121d

const HOD = require('./routes/HOD_Route');
app.use(HOD);

module.exports.app = app;