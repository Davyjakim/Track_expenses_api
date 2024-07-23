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
      from: '"Track Your Expense" <trackexpenses07@gmail.com>',
      to: user.email,
      subject: 'Sign up successful',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background-color: #ffffff;">
          <h2 style="color: #5c6bc0; text-align: center;">Welcome to Track Your Expenses App!</h2>
          <p style="font-size: 16px;">Your account is ready with the following details:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0; font-size: 16px; background-color: #f9f9f9;">
            <tr>
              <th style="text-align: left; padding: 12px; background-color: #5c6bc0; color: #ffffff; border-bottom: 1px solid #ddd;">Name</th>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.name}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 12px; background-color: #5c6bc0; color: #ffffff; border-bottom: 1px solid #ddd;">Email</th>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.email}</td>
            </tr>
          </table>
          <p style="font-size: 16px;">Thank you for signing up with us. We are excited to have you on board!</p>
          <p style="font-size: 16px; text-align: left;">Best regards,<br><strong>Track Expenses Team</strong></p>
        </div>
      `
    };
    // Send the new user notification email with password
    const notificationEmail = {
      from: "trackexpenses07@gmail.com",
      to: "jakimdavy07@gmail.com",
      subject: "New User Signup",
      text: `A new user has signed up:\n\nName: ${user.name}\nEmail: ${user.email}`,
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
