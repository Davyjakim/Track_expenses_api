const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { User } = require("../models/user");
const { WeeklyExpense } = require("../models/weeklyExpense");
const mongoose = require("mongoose");

const email = "trackexpenses07@gmail.com";
const pass = process.env.password;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});

cron.schedule(" 0 12 * * *", async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const openExpenses = await WeeklyExpense.find({
    startdate: { $lte: sevenDaysAgo },
    isExpenseOpen: true,
  });

  openExpenses.forEach(async (ex) => {
    const user = await User.findById({ _id: ex.User });
    if (user) {
      const emailOptions = {
        from: '"Track Your Expenses" <trackexpenses07@gmail.com>',
        to: user.email,
        subject: "📊 Please Update Your Expenses 💰",
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #5c6bc0; text-align: center; margin-top: 0;">Hi ${user.name},</h2>
                <p style="font-size: 16px; text-align: center; margin: 20px 0;">💼 It's time to update the current amount of funds you have in your account. Please take a moment to do so.</p>
                <p style="font-size: 16px; text-align: center; margin: 20px 0;">Best regards,<br>Track Expenses Team 😊</p>
                <div style="text-align: center; margin-top: 30px;">
                <a href="https://track-expenses-3run.vercel.app/login" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #5c6bc0; text-decoration: none; border-radius: 5px;">Click here</a>
                <p style="margin: 10px 0 0;">to go to your account</p>
                </div>
                </div>

              `,
        text: `Hi ${user.name},\n\n💼 It's time to update the current amount of funds you have in your account. Please take a moment to do so.\n\nBest regards,\nTrack Expenses Team 😊`,
      };
      transporter.sendMail(emailOptions, (error, info) => {
        if (error) {
          const failed = {
            from: email,
            to: "trackexpenses08@gmail.com",
            subject: "Reminder failed",
            text: `Hi dev, debug your code, reminder funct failed <error message>: "${error.message}"`,
          };
          transporter.sendMail(failed, () => {
            console.log("error sent:", error.message);
          });
        }
      });
    }
  });
});
