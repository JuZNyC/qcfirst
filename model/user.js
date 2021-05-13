const mongoose = require('mongoose');
const Class = require('./class');


const Schema = mongoose.Schema;
var personSchema = new Schema(
    {
        firstName : {type: String, required: true},
        lastName: {type: String, required: true},
        email : {type: String, required: true, index: { unique: true }},
        password : {type: String, required: true},
        userType: {type: String, enum: ["student", "faculty"]},
        registeredClasses : [{type: Schema.Types.ObjectId, ref: Class}]
    },
    {collection: 'users'}
);

const userModel = mongoose.model("User", personSchema);
module.exports = userModel;