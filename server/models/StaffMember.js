const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffMemberSchema = new Schema(
    {
        id:{type:String, unique:true, required: true},
        email:{type: String, unique: true, required: true},
        password:{type: String, default: '123456', required: true},
        name:String,
        gender:{type:String,enum:['male','female']},
        salary:Number,
        dayOff: Number,
        officeLoc: String,
        leaves: Number,
        attendance:[{signIn: Date, signOut: Date}],
        startDay: Date    // The day on which the Staff member started his job at the University
    }
);
module.exports = mongoose.model('StaffMember', StaffMemberSchema);
