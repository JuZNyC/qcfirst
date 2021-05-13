const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;


const semesterSchema = new Schema(
    {
        season : {type: String, enum: ["spring", "summer", "fall", "winter"], required: true},
        year: {type: String, required: true}
    }
);

const scheduleSchema = new Schema(
    {
        days: {type: [String], enum: ["monday", "tuesday", "wednesday", "thursday", "friday"], required: true},
        from: {type: String, required: true},
        to: {type: String, required: true}
    } 
);


const classSchema = new Schema(
    {
        semester : {type: semesterSchema, required: true},
        department : {type: String, required: true},
        name : {type: String, required: true},
        number: {type: Number, required: true},
        roster : {type: [User]},        
        instructor : {type: [User], required: true},
        description : {type: String, required: true},
        capacity : {type: Number, required: true},
        enrollmentDeadline: {type: Date, required: true},
        schedule: {type: scheduleSchema, required: true}
    },
    {collection: 'courses'}
);

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;