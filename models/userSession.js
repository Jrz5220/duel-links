// used for retrieving a session document from the database

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

sessionSchema = new Schema({
    id: String,
    expires: Date,
    session: String
});

const UserSession = mongoose.model("Session", sessionSchema);

module.exports = UserSession;