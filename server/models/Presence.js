const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PresenceSchema = new Schema({
    startDate:Date,
    endDate: Date,
    memberID: {type:Schema.Types.ObjectId, ref:'Member'}
});
module.exports = {model:mongoose.model('Presence', PresenceSchema),schema:PresenceSchema};