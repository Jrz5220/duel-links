const router = require("express").Router();
const passport = require("passport");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {v4: uuidv4} = require("uuid");
const User = require("./../models/user");
const UserSession = require("./../models/userSession");
const genericErrorMsg = "An error on the server prevented your request from executing. Please go back and try again. If you continue to receive errors, please send me an email detailing your problem at https://jrz5220.github.io/felixlazo/contact.html and I will respond as soon as I can.";
