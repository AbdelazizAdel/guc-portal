const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');
const app = express();


app.use(express.json())
//const generalRoutes = require('./routes/general.js');

const HOD = require('./routes/HOD_Route');
app.use(HOD);

//app.use(generalRoutes);
module.exports.app = app;