const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

/*
Schema - defines the type of data to go into a model.
Model - the interface used to connect to a collection within a mongo database.
Document - an instance of a model containing data returned from the database.
          you should not create an instance of a document. the model instance returns the document.
*/

const Schema = mongoose.Schema;

const userSchema =  new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    // password field generated by passport-local-mongoose
    favorites: [{duelTitle: String, duelName: String}],
    history: [{duelTitle: String, duelName: String}],
    idForResettingPwd: {type: String, required: true}
});

// allows passport-local-mongoose to regsiter username and password fields to schema
// adds passport-local-mongoose methods to the schema
userSchema.plugin(passportLocalMongoose, {
    limitAttempts: true,
    maxAttempts: 3,
    unlockInterval: 600000
}); // salts and hashes password for the user schema

module.exports = mongoose.model("User", userSchema);