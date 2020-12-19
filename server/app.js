const express = require('express');
const app = express();

// middleware for transforming String into JSON
app.use(express.json());

// middleware for using the general routes
const generalRoutes = require('./routes/general.js');
app.use(generalRoutes);


module.exports.app = app;