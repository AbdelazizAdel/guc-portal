const mongoose = require('mongoose');

const metaDataScheme = new mongoose.Schema({
   
    sequenceName: {type: String, required: true, unique: true},
    lastId: Number
});


module.exports = mongoose.model('metaData', metaDataScheme);