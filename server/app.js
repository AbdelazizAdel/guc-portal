const express = require('express');
const app = express();


app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
app.use(generalRoutes);

const HOD = require('./routes/HOD_Route');
app.use(HOD);

module.exports.app = app;