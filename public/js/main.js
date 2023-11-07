const validatePassword = function(pwd, confirmPwd) {
  const pwdChecker = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/);
  console.log("checking passwords: " + pwd + " + " + confirmPwd);
  if((/\s/).test(pwd))
    throw new Error("Password cannot contain spaces");
  if(pwd.length < 8 || pwd.length > 16)
    throw new Error("Password must be between 8 - 16 characters long");
  if(pwdChecker.exec(pwd) === null)
    throw new Error("Password must contain at least one lowercase, uppercase, number, and special character");
  if(pwd.localeCompare(confirmPwd, "en") !== 0)
    throw new Error("Passwords must match");
  console.log("passwords are valid");
}

if(document.getElementById("loginForm") != undefined && document.getElementById("loginForm") !== null) {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");
    const loginWarning = document.getElementById("loginWarning");
    const serverLoginErr = document.getElementById("serverLoginErr");
    const userLogin = {
      username: username,
      password: password
    }
    console.log("login attempt: " + username);
    fetch("/authenticateLogin", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(userLogin)}).then(res => {
      console.log("/authenticateLogin res: " + res.status);
      return res.json();
    }).then(json => {
      console.log("json response: " + JSON.stringify(json));
      loginWarning.innerHTML = "";  // clear contents of the alert to inject a new message
      if(serverLoginErr !== null)
          serverLoginErr.remove();
      if(json.error !== null) {
        loginWarning.innerHTML = `<p>A server error prevented your data from submitting. Please try again later.</p>`;
        return;
      }
      if(json.maxLoginAttemptsReached) {
        loginWarning.innerHTML = `<p>You have reached the maximum login attempts and have been temporarily locked out</p>`;
        return;
      }
      if(!json.loginSuccess) {
        loginWarning.innerHTML = `<p>Incorrect username or password</p>`;
        return;
      }
      form.submit();
    }).catch(error => {
      loginWarning.innerHTML = "";
      if(serverLoginErr !== null)
        serverLoginErr.remove();
      loginWarning.innerHTML = `<p>Could not submit form due to error: ${error.name}</p>`;
    });
  });
}

if(document.getElementById("registerForm") !== undefined && document.getElementById("registerForm") !== null) {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const newPwd = formData.get("password");
    const confirmNewPwd = formData.get("confirmPwd");
    const userEmail = formData.get("email");
    const userInputWarning = document.getElementsByClassName("userInputWarning")[0];
    try {
      validatePassword(newPwd, confirmNewPwd);
    } catch(error) {
      const serverMsg = document.getElementById("serverMsg");
      if(serverMsg !== null) {
        serverMsg.remove();
      }
      userInputWarning.innerHTML = "";
      userInputWarning.innerHTML = `<p class="warningWithBorder"><i class="fas fa-times-circle pe-2" aria-hidden="true"></i> ${error.message}</p>`;
      return;
    }
      fetch("/checkUsernameAvailability", {method: "POST", headers: {"Content-type": "application/json"}, body: JSON.stringify({username: formData.get("username")})}).then(res => {
        if(res.ok) {
          return fetch("/checkEmailAvailability", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email: userEmail})});
        }
        if(res.status === 400) {
          return {usernameWarning: "That username already exists"};
        }
        return {usernameWarning: "Could not register account due to a server error. Please try again later."};
      }).then(data => {
        userInputWarning.innerHTML = "";
        if(data.usernameWarning !== undefined) {
          userInputWarning.innerHTML = `<p class="warningWithBorder"><i class="fas fa-times-circle pe-2" aria-hidden="true"></i> ${data.usernameWarning}</p>`;
          return;
        }
        if(data.status === 400) {
          userInputWarning.innerHTML = `<p class="warningWithBorder"><i class="fas fa-times-circle pe-2" aria-hidden="true"></i> That email is already registered</p>`;
          return;
        }
        if(data.status === 500) {
          userInputWarning.innerHTML = `<p class="warningWithBorder"><i class="fas fa-times-circle pe-2" aria-hidden="true"></i> Could not register account due to a server error. Please try again later.</p>`;
          return;
        }
        console.log("register new user");
        form.submit();
      }).catch(error => {
        document.getElementsByClassName("userInputWarning")[0].innerHTML = "";
        document.getElementsByClassName("userInputWarning")[0].innerHTML = `<p class="warningWithBorder"><i class="fas fa-times-circle pe-2" aria-hidden="true"></i> ${error.message}</p>`;
        return;
      });
  });
}

if(document.getElementById("resetPwdForm") !== undefined && document.getElementById("resetPwdForm") !== null) {
  const form = document.getElementById("resetPwdForm");
  form.addEventListener("submit", function(event) {
    // event.preventDefault();
    console.log("reset pwd form submitted");
    const formData = new FormData(form);
    const newPwd = formData.get("newPwd");
    const confirmNewPwd = formData.get("confirmNewPwd");
    const passwordWarning = document.getElementsByClassName("passwordWarning")[0];
    try {
      validatePassword(newPwd, confirmNewPwd);
    } catch(error) {
      event.preventDefault();
      if(document.getElementById("serverMsg") !== null) {
        document.getElementById("serverMsg").remove();
      }
      passwordWarning.innerHTML = "";
      passwordWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> ${error.message}`;
      return;
    }
    console.log("valid new password submitted");
  });
}

if(document.getElementById("changePasswordForm") !== undefined && document.getElementById("changePasswordForm") !== null) {
  const form = document.getElementById("changePasswordForm");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const currentPwd = formData.get("currentPwd");
    const passwordWarning = document.getElementsByClassName("passwordWarning")[0];
    const emailWarning = document.getElementsByClassName("emailWarning")[0];
    const serverPwdErr = document.getElementById("serverPwdErr");
    const serverEmailErr = document.getElementById("serverEmailErr");
    fetch("/authenticatePassword", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({username: formData.get("username"), password: currentPwd})})
      .then(function(res) {
        if(res.ok) {
          try {
            validatePassword(formData.get("newPwd"), formData.get("confirmNewPwd"));
          } catch(error) {
            console.log("caught error while validating password");
            if(serverPwdErr !== null) {
              serverPwdErr.remove();
            }
            if(serverEmailErr !== null) {
              serverEmailErr.remove();
            }
            if(emailWarning.innerHTML) {
              emailWarning.innerHTML = "";
            }
            passwordWarning.innerHTML = "";
            passwordWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> ${error.message}`;
            return;
          }
          console.log("submitting new password form");
          form.submit();
        } else if(res.status === 400) {
          if(serverPwdErr !== null) {
            serverPwdErr.remove();
          }
          if(serverEmailErr !== null) {
            serverEmailErr.remove();
          }
          if(emailWarning.innerHTML) {
            emailWarning.innerHTML = "";
          }
          passwordWarning.innerHTML = "";
          passwordWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> Your current password is incorrect`;
          return;
        } else if(res.status === 500) {
          if(serverPwdErr !== null) {
            serverPwdErr.remove();
          }
          if(serverEmailErr !== null) {
            serverEmailErr.remove();
          }
          if(emailWarning.innerHTML) {
            emailWarning.innerHTML = "";
          }
          passwordWarning.innerHTML = "";
          passwordWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> A server error prevented your account from being updated. Please try again later.`;
          return;
        }
      }).catch(error => {
        document.getElementsByClassName("passwordWarning")[0].innerHTML = "";
        document.getElementsByClassName("passwordWarning")[0].innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> ${error.message}`;
        return;
      });
  });
}

if(document.getElementById("changeEmailForm") !== undefined && document.getElementById("changeEmailForm") !== null) {
  const form = document.getElementById("changeEmailForm");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const newEmail = formData.get("newEmail");
    const passwordWarning = document.getElementsByClassName("passwordWarning")[0];
    const emailWarning = document.getElementsByClassName("emailWarning")[0];
    const serverPwdErr = document.getElementById("serverPwdErr");
    const serverEmailErr = document.getElementById("serverEmailErr");
    fetch("/checkEmailAvailability", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email: newEmail})})
    .then(function(res) {
      if(res.ok) {
        form.submit();
      } else if(res.status === 400) {
        if(serverPwdErr !== null) {
          serverPwdErr.remove();
        }
        if(serverEmailErr !== null) {
          serverEmailErr.remove();
        }
        if(passwordWarning.innerHTML) {
          passwordWarning.innerHTML = "";
        }
        emailWarning.innerHTML = "";
        emailWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> That email is already registered`;
        return
      } else {
        if(serverPwdErr !== null) {
          serverPwdErr.remove();
        }
        if(serverEmailErr !== null) {
          serverEmailErr.remove();
        }
        if(passwordWarning.innerHTML) {
          passwordWarning.innerHTML = "";
        }
        emailWarning.innerHTML = "";
        emailWarning.innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i> A server error prevented your account from being updated. Please try again later.`;
        return;
      }
    }).catch(error => {
      document.getElementsByClassName("emailWarning")[0].innerHTML = "";
      document.getElementsByClassName("emailWarning")[0].innerHTML = `<i class="fas fa-times-circle pe-1" aria-hidden="true"></i>${error.message}`;
      return;
    });
  });
}