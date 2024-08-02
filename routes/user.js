const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const { WeeklyExpense } = require("../models/weeklyExpense");
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { Admin } = require("../middleware/Admin");
const nodemailer = require("nodemailer");
const { Comment } = require("../models/comment");
const { MonthlyExpense } = require("../models/monthlyExpense");
const { text } = require("body-parser");

const email = "trackexpenses07@gmail.com";
const pass = process.env.password;
//getting me the User
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

router.get("/", Admin, async (req, res) => {
  const user = await User.find().select("-password");
  res.send(user);
});

router.get("/viewdetails/:id", Admin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    const comment = await Comment.find({ User: req.params.id });
    const weeklyExpense = await WeeklyExpense.find({ User: req.params.id });
    const monthexpense = await MonthlyExpense.find({ User: req.params.id });

    const currentMonth = new Date().getMonth();
    let currentMonthExp = [];

    monthexpense.forEach((mE) => {
      if (mE.date.getMonth() === currentMonth) {
        currentMonthExp.push(mE);
      }
    });

    res.send({ currentMonthExp, weeklyExpense, user, comment });
  } catch (error) {
    console.log(error);
  }
});

router.post("/email/ReminderForME/:id", Admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      const inactivity = {
        from: '"Track Your Expense" <trackexpenses07@gmail.com>',
        to: user.email,
        subject: "Reminder",
        html: `
          <html>
  <head>
    <style>
      body {
        font-family: sans-serif;
        color: #4a4a4a;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #f0f0f5;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #4b0082;
        padding: 20px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        margin: 20px 0;
      }
      .button {
        display: inline-block;
        padding: 15px 25px;
        background-color: #800080;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin: 20px 0;
      }
      .footer {
        background-color: #4b0082;
        padding: 15px;
        text-align: center;
        color: #ffffff;
        font-size: 14px;
      }
      .footer p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Track Your Expense</h1>
      </div>
      <div class="content">
        <p>Dear ${user.name},</p>
        <p>We've noticed you've been inactive.</p>
        <p>Click the button below to log in:</p>
        <a href="https://track-expenses-3run.vercel.app/login" class="button">Login</a>
        <p>For more info log in and click "How It Works".</p>
        <p>
          If you have questions, use the comment section, and we'll respond
          ASAP.
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Track Your Expense</p>
      </div>
    </div>
  </body>
</html>
        `,
      };

      await transporter.sendMail(inactivity);
      res.status(200).send("email sent");
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred");
  }
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
      subject: "Sign up successful",
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
      `,
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
