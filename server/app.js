const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
//const generalRoutes = require('./routes/general.js');

//app.use(generalRoutes);
module.exports.app = app;