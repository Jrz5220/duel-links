const router = require("express").Router();
const passport = require("passport");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {v4: uuidv4} = require("uuid");
const User = require("./../models/user");
const UserSession = require("./../models/userSession");
const genericErrorMsg = "An error on the server prevented your request from executing. Please go back and try again. If you continue to receive errors, please send me an email detailing your problem at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as I can.";

function setServerMessage(appRef, theMsg) {
  appRef.enable("hasServerMsg");
  appRef.set("theMsg", theMsg);
}
function renderGenericRedirectPage(res, titleTagContent = "Duel Links Replays", hasUserData = false, theUserData = null, mainHeader = "Something Went Wrong", theMsg = "Not sure what happened, but you have been redirected to this page. Please return home and try again.", hasLink = false, linkReference = "/", linkText = "Home") {
  try {
    res.render("redirect", {pageTitle: titleTagContent, containsUserData: hasUserData, displayUserData: theUserData, theHeader: mainHeader, theMessage: theMsg, hasAnotherLink: hasLink, theLink: linkReference, linkText: linkText});
  } catch(err) {
    res.render("redirect", {pageTitle: "Error", containsUserData: false, displayUserData: null, theHeader: "An Error Has Occured", theMsg: "An error has prevented the server from redirecting you to your page. You may need to return to the home page or send me an email about what happened.", hasAnotherLink: true, theLink: "https://jrz5220.github.io/felixlazo/contact.html", linkText: "Email Me"});
  }
}
// called when the password entered is incorrect AND it was the third failed login attempt (failed login attempts is maxed out at 3)
// reset the user's login attempts back to 0 if at least 20 minutes have passed since the last failed attempt
function checkFailedLoginAttempts(appReference, userDocument) {
  const lastLoginAttempt = userDocument.last;   // "last" is a passport-local-monoogse field containing the date object of the last login attempt
  const today = new Date();
  if(today.toLocaleDateString("en-US").localeCompare(lastLoginAttempt.toLocaleDateString("en-US")) !== 0) {
    userDocument.resetAttempts(function(err, savedUser) {
      if(err)
        throw err;
      else
        appReference.disable("maxLoginAttemptsReached");
    });
  } else {
    let lastAttempt = lastLoginAttempt.getTime();
    let curAttempt = today.getTime();
    let timeDifference = curAttempt - lastAttempt;
    let timeDifInMin = Math.floor((timeDifference/1000)/60);
    if(timeDifInMin >= 20) {
      userDocument.resetAttempts((err, savedUser) => {
        if(err)
          throw err;
        else
          appReference.disable("maxLoginAttemptsReached");
      });
    } else {
      if(userDocument.attempts >= 3) {
        appReference.enable("maxLoginAttemptsReached");
      }
    }
  }
}

router.param("user", function(req, res, next, id) {
  if(req.isAuthenticated()) {
    User.findOne({username: id}, function(err, foundUser) {
      if(err) {
        next(err);
      } else if(!foundUser) {
        setServerMessage(req.app, "Please sign in");
        res.redirect("/logout");
      } else {
        req.user = foundUser;
        next();
      }
    });
  } else {
    setServerMessage(req.app, "Please sign in");
    res.redirect("/");
  }
});


// ----------------- ROUTES -----------------
router.get("/", function(req, res) {
  res.render("index", {hasServerMsg: req.app.get("hasServerMsg"), theMsg: req.app.get("theMsg"), isLoggedIn: req.isAuthenticated()});
  req.app.disable("hasServerMsg");
});

router.get("/sign-in", function(req, res) {
  try {
    setServerMessage(req.app, "Please sign in");
    res.redirect("/");
  } catch(error) {
    res.status(500).json({success: false, error: error.name, message: genericErrorMsg});
  }
});

router.post("/sign-in", passport.authenticate("local", {failureRedirect: "/loginfail", failureMessage: true}), function(req, res) {
  res.redirect("/account/" + req.body.username);
});

router.get("/loginfail", function(req, res) {
  try {
    setServerMessage(req.app, "invalid username/password");
    if(req.app.get("maxLoginAttemptsReached"))
      setServerMessage(req.app, "You have reached the maximum login attempts and have been temporarily locked out");
  } catch(error) {
    res.status(500).json({success: false, error: error.name, message: genericErrorMsg});
  }
  const backURL = req.header('Referer') || "/";
  res.redirect(backURL);
});

router.get("/logout", function(req, res) {
  req.logout(function(err) {
    if(err)
      res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
    else
      res.redirect("/");
  });
});

router.get("/account", function(req, res) {
  try {
    res.redirect("/account/" + req.user.username);  // "user" property is created in app.param("user") when successfully signed in
  } catch(error) {
    setServerMessage(req.app, "Please sign in");
    res.redirect("/");
  }
});

router.get("/account/:user", function(req, res) {
  if(req.isAuthenticated()) {
    let favDuelNames = [];
    let favVidTitles = [];
    let histDuelNames = [];
    let histVidTitles = [];
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(err) {
        res.status(500).json({success: false, error: err.name, message: "An error on the server prevented your account from being identified. Please logout and try again. If you continue to recieve errors, please email me at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as I can."});
      } else if(!foundUser) {
        setServerMessage(req.app, "Your username could not be identified. Please sign in again.");
        res.redirect("/logout");
      } else {
        try {
          let hasFavVideos = (foundUser.favorites.length > 0);
          let hasHistVideos = (foundUser.history.length > 0);
          for(let i=0; i < foundUser.favorites.length; i++) {
            favDuelNames.push(foundUser.favorites[i].duelName);
            favVidTitles.push(foundUser.favorites[i].duelTitle);
          }
          for(let i=0; i < foundUser.history.length; i++) {
            histDuelNames.push(foundUser.history[i].duelName);
            histVidTitles.push(foundUser.history[i].duelTitle);
          }
          res.render("account", {
            username: foundUser.username,
            userEmail: foundUser.email,
            hasFavVideos: hasFavVideos,
            hasHistVideos: hasHistVideos,
            favDuelNames: favDuelNames,
            favVidTitles: favVidTitles,
            histDuelNames: histDuelNames,
            histVidTitles: histVidTitles,
            hasServerMsg: req.app.get("hasServerMsg"),
            theMsg: req.app.get("theMsg"),
            hasNewPwdMsg: req.app.get("hasNewPwdMsg"),
            newPwdMsg: req.app.get("newPwdMsg"),
            invalidNewEmail: req.app.get("invalidNewEmail"),
            newEmailErrMsg: req.app.get("newEmailErrMsg")
          });
          req.app.disable("hasServerMsg");
          req.app.disable("hasNewPwdMsg");
          req.app.disable("invalidNewEmail");
          // should there be a timeout function to limit the amount of time a user stays signed in?
        } catch(error) {
          renderGenericRedirectPage(res, "An Error Has Occured", false, null, "Error: " + error.name, "An error on the server prevented your request from executing. Please logout and try again. If you continue to recieve errors, please email me and I will respond as soon as possible.", true, "/logout", "Logout");
        }
      }
    });
  } else {
    setServerMessage(req.app, "Please sign in");
    res.redirect("/");
  }
});

router.get("/forgotPassword", function(req, res) {
  let ariaInvalid = false;
  if(req.app.get("hasServerMsg") === true)
    ariaInvalid = true;
  res.render("forgotPassword", {hasServerMsg: req.app.get("hasServerMsg"), theMsg: req.app.get("theMsg"), ariaInvalid: ariaInvalid});
  req.app.disable("hasServerMsg");
});

// get+post /requestPasswordReset
