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
// here

router.get("/resetPassword/:id/:token", function(req, res) {
  const {id, token} = req.params;
  console.log("find user with id: " + id);  // for some reason, when you click the reset link, gmail sends a link with "css" as the id
  User.findById(id, function(err, foundUser) {
    if(err) {
      res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
    } else if(!foundUser) {
      renderGenericRedirectPage(res, "User Not Found", false, null, "User Not Found", "Your account could not be identified by the server. You can request a new reset link by submitting the email registered to your account.", true, "/forgotPassword", "Reset Password");
    } else {
      // verify the token to make sure it hasn't been tampered with
      try {
        console.log("found user: " + foundUser.username);
        const secret = process.env.JWT_SECRET + foundUser.idForResettingPwd;
        console.log("verify the secret: " + secret);
        console.log("verify the token: " + token);
        const payload = jwt.verify(token, secret);  // if the token is not a match, an error is thrown
        const submitPwdLink = foundUser.id + "/" + token;
        res.render("resetPassword", {submitPwdLink: submitPwdLink, invalidPwd: req.app.get("hasServerMsg"), passwordErr: req.app.get("theMsg")});
        req.app.disable("hasServerMsg");
      } catch(error) {
        if(error instanceof jwt.TokenExpiredError)
          renderGenericRedirectPage(res, "Link Expired", false, null, "Your Reset Link Has Expired", "You must submit your email again to get a new reset link.", true, "/forgotPassword", "Reset Password");
        else if(error instanceof jwt.JsonWebTokenError)
          renderGenericRedirectPage(res, "Invalid Link", false, null, "Invalid Link", "Your reset link could not be verified. Please try requesting a new reset link. If you continue to receive errors, please send me an email and I will respond as soon as possible.", true, "/forgotPassword", "Reset Password");
        else
          renderGenericRedirectPage(res, "An Error Has Occured", false, null, "Error: " + error.name, "Your reset link does not work due to a server error. Please try requesting a new reset link. If you continue to receive errors, please send me an email and I will respond as soon as possible.", true, "/forgotPassword", "Reset Password");
      }
    }
  });
});

router.post("/submitNewPassword/:id/:token", function(req, res) {
  const {id, token} = req.params;
  User.findById(id, function(err, foundUser) {
    if(err) {
      renderGenericRedirectPage(res, "An Error Has Occured", false, null, "Error: " + err.name, "An error on the server prevented your password from being updated. Please try reseting your password again by requesting a new reset link. If you continue to recieve errors, please send me an email and I will respond as soon as possible.", true, "/forgotPassword", "Reset Password");
    } else if(!foundUser) {
      renderGenericRedirectPage(res, "User Not Found", false, null, "User Not Found", "Your account could not be identified. Please try requesting a new reset link by using the email registered to your account.", true, "/forgotPassword", "Reset Password");
    } else {
      const newPwd = req.body.newPwd;
      const confirmNewPwd = req.body.confirmNewPwd;
      const pwdChecker = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/);
      if((/\s/).test(newPwd)) {
        setServerMessage(req.app, "No whitespace");
        res.redirect("/resetPassword/" + id + "/" + token);
      } else if(newPwd.localeCompare(confirmNewPwd, "en") !== 0) {
        setServerMessage(req.app, "Passwords must match");
        res.redirect("/resetPassword/" + id + "/" + token);
      } else if(newPwd.length < 8 || newPwd.length > 16) {
        setServerMessage(req.app, "Password must be between 8 - 16 characters long");
        res.redirect("/resetPassword/" + id + "/" + token);
      } else if(pwdChecker.exec(newPwd) === null) {
        setServerMessage(req.app, "Password must contain at least one lowercase, uppercase, number, and special character");
        res.redirect("/resetPassword/" + id + "/" + token);
      } else {
        foundUser.setPassword(newPwd, function(err, user) {
          if(err) {
            renderGenericRedirectPage(res, "An Error Occured", false, null, "Error: " + err.name, "A server error prevented your password from being updated. Please go back and try again or request a new reset link. If you continue to recieve errors, please send me an email and I will respond as soon as possible.", true, "/forgotPassword", "Request New Link");
          } else if(user) {
            try {
              setServerMessage(req.app, "Successfully updated password");
              foundUser.idForResettingPwd = uuidv4();
              foundUser.save();
              renderGenericRedirectPage(res, "Password Updated", false, null, "Successfully Updated Password", "You can now sign in using your new password.", false);
            } catch(error) {
              res.status(500).json({success: false, error: err.name, message: "An error on the server occured. Please try using your new password to sign in. If it fails, your password might not have been updated. In that case, you can send me an email at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as possible."});
            }
          }
        });
      }
    }
  });
});

router.get("/registerPage", function(req, res) {
  res.render("register", {hasServerMsg: req.app.get("hasServerMsg"), theMsg: req.app.get("theMsg")});
  req.app.disable("hasServerMsg");
});

router.route("/registerAccount")
  .get(function(req, res) {
    res.redirect("/registerPage");
  })
  .post(function(req, res) {
    User.countDocuments(function(err, users) {
      if(err) {
        res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
      } else if(users > 3) {
        setServerMessage(req.app, "database is full. failed to register account.");
        res.redirect("/registerPage");
      } else {
        let thePwd = req.body.password;
        let confirmPwd = req.body.confirmPwd;
        let pwdChecker = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/);
        if((/\s/).test(thePwd)) {
          setServerMessage(req.app, "Password cannot contain whitespace");
          res.redirect("/registerPage");
        } else if(thePwd.length < 8 || thePwd.length > 16) {
          setServerMessage(req.app, "Password must be between 8 - 16 characters long");
          res.redirect("/registerPage");
        } else if(pwdChecker.exec(thePwd) === null) {
          setServerMessage(req.app, "Password must contain at least one lowercase, uppercase, number, and special character");
          res.redirect("/registerPage");
        } else if(thePwd.localeCompare(confirmPwd, "en") !== 0) {
          setServerMessage(req.app, "Passwords must match");
          res.redirect("/registerPage");
        } else {
          let resetPwdId = uuidv4();
          User.register(new User({username: req.body.username, email: req.body.email, idForResettingPwd: resetPwdId}), thePwd, function(err, user) {
            if(err) {
              if(err.name === "UserExistsError") {
                setServerMessage(req.app, "A user with that username already exists");
                res.redirect("/registerPage");
              } else {
                res.status(500).json({success: false, error: err.name, message: "An error prevented your account from being registered. Please go back and try again. If you continue to recieve errors, please send me an email at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as possible."});
              }
            } else {
              // authenticate user (alternate version)
              // passport.authenticate("local")(req, res, function() {
              //   console.log("user authenticated!");
              //   res.redirect("/account");
              // });
              res.redirect("/registrationComplete");
            }
          });
        }
      }
    });
  });

router.get("/registrationComplete", function(req, res) {
  res.render("redirect", {pageTitle: "Registration Complete", containsUserData: false, displayUserData: null, theHeader: "Thank You For Registering!", theMessage: "You can now sign in using your new username and password.", hasAnotherLink: false, theLink: "/", linkText: null});
});

router.post("/account/:user/removeFavVideos", function(req, res) {      // "user" param gets authenticated in app.param() function
  const videosToRemove = req.body.videoToRemove;
  let deletingOneVideo = false;
  // if user is deleting only one video, videosToRemove is a string (the title of the video)
  // if multiple videos are being deleted, videosToRemove is an array (list of videos to remove)
  // if no videos were selected when the delete button was pressed, videosToRemove is undefined
  if(typeof videosToRemove === "string") {
    deletingOneVideo = true;
  }
  User.findOne({username: req.user.username}, function(err, foundUser) {
    if(err) {
      res.status(500).json({success: false, error: err.name, message: "An error on the server prevented your request from executing. Please logout and try again. If you continue to recieve errors, you can send me an email at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as possible."});
    } else if(!foundUser) {
      setServerMessage(req.app, "Your username could not be identified. Please sign in again.");
      res.redirect("/logout");
    } else {
      if(videosToRemove !== undefined && videosToRemove !== null) {
        if(deletingOneVideo) {
          for(let i = 0; i < foundUser.favorites.length; i++) {
            if(videosToRemove === foundUser.favorites[i].duelTitle) {
              foundUser.favorites.splice(i, 1);
              break;
            }
          }
        } else {
          for(let i = 0; i < videosToRemove.length; i++) {
            let theVideoToRemove = videosToRemove[i];
            for(let j = 0; foundUser.favorites.length; j++) {
              if(theVideoToRemove === foundUser.favorites[j].duelTitle) {
                foundUser.favorites.splice(j, 1);
                break;
              }
            }
          }
        }
        foundUser.save().then(function(savedUser) {
          res.redirect("/account/" + foundUser.username);
        });
      } else {
        res.status(500).json({success: false, message: "Could not delete the videos. Please go back and try again. If you are unable to delete the videos, please send me an email at https://jrz5220.github.io/felixlazo/contact.html and I will try to fix the problem."});
      }
    }
  });
});

router.post("/account/:user/removeHistoryVideos", function(req, res) {
  const videosToRemove = req.body.videoToRemove;
  let deletingOneVideo = false;
  // if user is deleting only one video, videosToRemove is a string (the title of the video)
  // if multiple videos are being deleted, videosToRemove is an array (list of videos to remove)
  // if no videos were selected when the delete button was pressed, videosToRemove is undefined
  if(typeof videosToRemove === "string") {
    deletingOneVideo = true;
  }
  User.findOne({username: req.user.username}, function(err, foundUser) {
    if(err) {
      res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
    } else if(!foundUser) {
      setServerMessage(req.app, "Your username could not be identified. Please sign in again.");
      res.redirect("/logout");
    } else {
      if(videosToRemove !== undefined && videosToRemove !== null) {
        if(deletingOneVideo) {
          for(let i = 0; i < foundUser.history.length; i++) {
            if(videosToRemove === foundUser.history[i].duelTitle) {
              foundUser.history.splice(i, 1);
              break;
            }
          }
        } else {
          for(let i = 0; i < videosToRemove.length; i++) {
            let theVideoToRemove = videosToRemove[i];
            for(let j = 0; foundUser.history.length; j++) {
              if(theVideoToRemove === foundUser.history[j].duelTitle) {
                foundUser.history.splice(j, 1);
                break;
              }
            }
          }
        }
        foundUser.save().then(function(savedUser) {
          res.redirect("/account/" + foundUser.username);
        });
      } else {
        res.redirect("/account/" + foundUser.username);
      }
    }
  })
});

router.route("/account/:user/changeEmail")
  .get(function(req, res) {
    try {
      res.redirect("/account/" + req.user.username);
    } catch(err) {
      setServerMessage(req.app, "Please sign in");
      res.redirect("/logout");
    }
  })
  .post(function(req, res) {
    let currentEmail = req.body.currentEmail;
    let newEmail = req.body.newEmail;
    User.findOneAndUpdate({email: currentEmail}, {email: newEmail}, function(err, foundUser) {
      if(err) {
        if(err.codeName === "DuplicateKey") {
          req.app.enable("hasServerMsg");
          req.app.set("invalidNewEmail", true);
          req.app.set("newEmailErrMsg", "That email is already registered");
          res.redirect("/account/" + req.user.username);
        } else {
          res.status(500).json({success: false, error: err.name, message: "An error on the server prevented your request from executing. Please logout and try again. If you continue to recieve errors, you can send me an email at https://jrz5220.github.io/felixlazo/contact.html and I will repond as soon as possible."});
        }
      } else if(!foundUser) {
        setServerMessage(req.app, "Your account could not be identified. Please sign in again.");
        res.redirect("/logout");
      } else {
        res.redirect("/account/" + foundUser.username);
      }
    });
  });

router.route("/account/:user/changePassword")
  .get(function(req, res) {
    try {
      res.redirect("/account/" + req.user.username);
    } catch(err) {
      setServerMessage(req.app, "Please sign in");
      res.redirect("/logout");
    }
  })
  .post(function(req, res) {
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(err) {
        res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
      } else if(!foundUser) {
        setServerMessage(req.app, "Your account could not be identified. Please sign in again.");
        res.redirect("/logout");
      } else {
        let oldPwd = req.body.currentPwd;
        let newPwd = req.body.newPwd;
        let confirmNewPwd = req.body.confirmNewPwd;
        let pwdChecker = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/);
        req.app.enable("hasServerMsg");
        req.app.set("hasNewPwdMsg", true);
        if((/\s/).test(newPwd)) {
          req.app.set("newPwdMsg", "Password cannot contain spaces");
          res.redirect("/account/" + foundUser.username);
        } else if(newPwd.length < 8 || newPwd.length > 16) {
          req.app.set("newPwdMsg", "Password must be between 8 - 16 characters long");
          res.redirect("/account/" + foundUser.username);
        } else if(pwdChecker.exec(newPwd) === null) {
          req.app.set("newPwdMsg", "Password must contain at least one lowercase, uppercase, number, and special character");
          res.redirect("/account/" + foundUser.username);
        } else if(newPwd.localeCompare(confirmNewPwd, "en") !== 0) {
          req.app.set("newPwdMsg", "Passwords must match");
          res.redirect("/account/" + foundUser.username);
        } else {
          foundUser.changePassword(oldPwd, newPwd, function(err) {
            req.app.set("newPwdMsg", "Successfully updated password");
            if(err) {
              req.app.set("newPwdMsg", "Current password is incorrect");
            }
            res.redirect("/account/" + foundUser.username);
          });
        }
      }
    });
  });

router.post("/favorite", function(req, res) {
  if(req.isAuthenticated()) {
    let favoriteVideo = req.body.videoTitle;
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(err) {
        res.status(500).json({success: false, error: err.name, message: genericErrorMsg});
      } else if(!foundUser) {
        res.sendStatus(403);  // user not found
      } else {
        let isDuplicate = false;
        let userFavorites = foundUser.favorites;
        for(let i = 0; i < userFavorites.length; i++) {
          if(userFavorites[i].duelTitle === favoriteVideo) {
            isDuplicate = true;
          }
        }
        if(!isDuplicate) {
          if(userFavorites.length > 4) {
            userFavorites.pop();  // remove last video from array
          }
          userFavorites.unshift({duelTitle: favoriteVideo, duelName: req.body.duelName}); // add video to beginning of array
          foundUser.save().then(function(savedDoc) {
            res.sendStatus(200);  // successfully updated user favorites
          });
        } else {
          res.sendStatus(400);  // video is already a favorite
        }
      }
    });
  } else {
    res.sendStatus(401);  // user not signed in
  }
});

router.post("/updateFavorites", function(req, res) {
  if(req.isAuthenticated()) {
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(err) {
        const e = {
          "name": err.name,
          "message": err.message
        }
        res.status(500).json({addedVideo: false, removedVideo: false, error: e});
      } else if(!foundUser) {
        const e = {
          "name": "UserNotFoundError",
          "message": "A user with that username could not found"
        }
        res.status(401).json({addedVideo: false, removedVideo: false, error: e});
      } else {
        let favorites = foundUser.favorites;
        if(req.body.addToFavorites) {
          let favoriteVideo = req.body.videoTitle;
          let isDuplicate = false;
          for(let i = 0; i < favorites.length; i++) {
            if(favoriteVideo === favorites[i].duelTitle) {
              isDuplicate = true;
              break;
            }
          }
          if(!isDuplicate) {
            if(favorites.length > 4) {
              favorites.pop();  // remove last video from the array
            }
            favorites.unshift({duelTitle: favoriteVideo, duelName: req.body.duelName}); // add video to beginning of array
            foundUser.save().then(function(savedUser) {
              res.json({addedVideo: true, removedVideo: false, error: null});
            });
          } else {
            const e = {
              "name": "DuplicateEntryError",
              "message": "That video already exists in favorites"
            }
            res.status(400).json({addedVideo: false, removedVideo: false, error: e});
          }
        } else {
          let videoToRemove = req.body.videoTitle;
          for(let i = 0; i < favorites.length; i++) {
            if(videoToRemove === favorites[i].duelTitle) {
              favorites.splice(i, 1);
              break;
            }
          }
          foundUser.save().then(function(savedUser) {
            res.json({addedVideo: false, removedVideo: true, error: null});
          });
        }
      }
    });
  } else {
    const e = {
      "name": "NotAuthorizedError",
      "message": "User not logged in"
    }
    res.status(400).json({addedVideo: false, removedVideo: false, error: e});
  }
});
