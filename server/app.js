const express = require('express');
const app = express();
app.use(express.json());

const HOD_Route = require('./routes/HOD_Route.js');




module.exports.app = app;