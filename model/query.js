const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

var querySchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, ref: User, required: true},
        query : {type: String, required: true},
        result : {type: String, required: true},
    },
    {collection: 'query'}
);

const queryModel = mongoose.model("Query", querySchema);
module.exports = queryModel;