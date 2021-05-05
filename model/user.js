const mongoose = require('mongoose');


const Schema = mongoose.Schema;
var personSchema = new Schema(
    {
        firstName : {type: String, required: true},
        lastName: {type: String, required: true},
        email : {type: String, required: true, index: { unique: true }},
        password : {type: String, required: true},
        userType: {type: String, enum: ["student", "faculty"]}
    },
    {collection: 'users'}
);

const userModel = mongoose.model("User", personSchema);
module.exports = userModel;