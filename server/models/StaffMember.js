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
        leaves: Number, // indicates the number of leaves the staff member has taken
        attendance:[{signIn: Date, signOut: Date}],
        startDay: Date,    // The day on which the Staff member started his job at the University
        loggedIn: Boolean, // determines if this user is logged in or not (has a valid token)
        notifications : [String],
        firstLogin : Boolean,
        department : String
    }
);
module.exports = mongoose.model('StaffMember', StaffMemberSchema);