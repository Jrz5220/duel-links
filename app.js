require("dotenv).config();

const express = require("express");
/* use object document mapper (JavaScript objects to MongoDB documents) instead of native MondoDB driver */
const mongoose = require("mongoose");
/* parses HTTP request body and populates the req.body property with the parsed data */
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const routes = require("./routes/routes");
const duelVideoRoutes = require("./routes/duelVideoRoutes");
const User = require("./models/user");

/* creates an Express application */
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
/* allows express to parse content coming from an HTML form, which is of type application/x-www-form-urlencoded */
app.use(bodyParser.urlencoded({extended: true}));

// initialize a session (express-session)
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,  // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    touchAfter: 24 * 3600   // session be updated only one time in a period of 24 hours
  })
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());  // let passport handle sessions

// connect to the mongo db
try {
  mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
} catch(error) {
  console.log("could not connect to the mongo database. visit https://mongoosejs.com/docs/connections.html#error-handling for more information.");
}

passport.use(User.createStrategy());  // allow passport-local-mongoose to set up the passport-local strategey
// allow passport-local-mongoose to serialize (create cookie ids) and deserialize (view cookie information) users to and from a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// register route handlers
app.use("/duelVideo", duelVideoRoutes);
app.use("/", routes);

// set global server settings
app.set("maxLoginAttemptsReached", false);
app.set("hasServerMsg", false);

// if deploying on Heroku, specify correct port (visit Heroku for proper configuration)
let port = process.env.PORT;
if(port === null || port === undefined || port === "") {
  port = "3000";
}

app.listen(port, function(req, res) {
  console.log("Server successfully running on port " + port);
});
