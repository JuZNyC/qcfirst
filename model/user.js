const mongoose = require('mongoose');
const Class = require('./class');
const Schema = mongoose.Schema;

const semesterScheduleSchema = new Schema(
    {
        semester: {type: String, required:true},
        registeredClasses : [{type: Schema.Types.ObjectId, ref: Class}]
    }
)


var personSchema = new Schema(
    {
        firstName : {type: String, required: true},
        lastName: {type: String, required: true},
        email : {type: String, required: true, index: { unique: true }},
        password : {type: String, required: true},
        userType: {type: String, enum: ["student", "faculty", "admin"]},
        allClasses : [semesterScheduleSchema]
    },
    {collection: 'users'}
);

const userModel = mongoose.model("User", personSchema);
module.exports = userModel;