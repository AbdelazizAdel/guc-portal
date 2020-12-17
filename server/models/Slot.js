const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SlotSchema = new Schema({
    id:{type: Number, unique: true, required: true},
    day: {type: Number, required: true},
    period: {type: Number, required: true},
    location: {type: String, required: true},
    slotType: String,
    course: String,
    instructor: String
}
);

module.exports = mongoose.model('Slot',SlotSchema);
