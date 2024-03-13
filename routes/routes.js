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
/*
router.use("/sign-in", function(req, res, next) {
  User.findOne({username: req.body.username}, function(err, foundUser) {
    if(err) {
      next(err);
    } else if(!foundUser) {
      next();
    } else {
      try {
        console.log("use('/sign-in')");
        checkFailedLoginAttempts(req.app, foundUser);
      } catch(e) {
        console.log("caught error in /sign-in: " + e);
        next(e);
      }
      console.log("login attempts checked. passing to next function");
      next();
      // try {
      //   let lastLoginAttempt = foundUser.last;  // "last" is a passport-local-monoogse field containing the date object of the last login attempt
      //   let today = new Date();
      //   if(today.toLocaleDateString("en-US").localeCompare(lastLoginAttempt.toLocaleDateString("en-US")) !== 0) {
      //     console.log("a whole day has passed - reset attempts - a");
      //     foundUser.resetAttempts(function(err, savedUser) {
      //       if(err) {
      //         next("could not reset user login attempts");
      //       } else {
      //         try {
      //           console.log("saved user. user attempts: " + savedUser.attempts);
      //           next();
      //         } catch(e) {
      //           console.log("catch error: " + e);
      //           next(e);
      //         }
      //       }
      //     });
      //   } else {
      //     let lastAttemptTime = lastLoginAttempt.getTime();
      //     let curAttemptTime = today.getTime();
      //     let timeDifference = curAttemptTime - lastAttemptTime;
      //     let timeDifInMin = Math.floor((timeDifference/1000)/60);
      //     console.log("minutes passed since last attempt: " + timeDifInMin);
      //     if(timeDifInMin >= 20) {
      //       foundUser.resetAttempts(function(err, savedUser) {
      //         if(err) {
      //           console.log("reset attempts err: " + err);
      //           next("could not reset user login attempts");
      //         } else {
      //           try {
      //             console.log("saved user. user attempts: " + savedUser.attempts);
      //             next();
      //           } catch(e) {
      //             console.log("catch error: " + e);
      //             next(e);
      //           }
      //         }
      //       });
      //     } else {
      //       console.log("user login attempts: " + foundUser.attempts);
      //       console.log("only " + timeDifInMin + " minutes have passed. wait a lil more");
      //       if(foundUser.attempts >= 3) {
      //         req.app.enable("maxLoginAttemptsReached");
      //         console.log("max login attempts reached");
      //       }
      //       next();
      //     }
      //   }
      // } catch(error) {
      //   next(error);
      // }
    }
  });
});
*/
