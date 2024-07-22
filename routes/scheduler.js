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

cron.schedule(' 0 12 * * *', async() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const openExpenses = await WeeklyExpense.find({
      startdate: { $lte: sevenDaysAgo },
      isExpenseOpen: true,
    })

    openExpenses.forEach(async(ex)=>{
        const user = await User.findById({_id:ex.User})
        if( user){
            const emailOptions = {
                from: email,
                to: user.email,
                subject: "📊 Please Update Your Expenses 💰",
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
                      transporter.sendMail(failed, ()=>{
                        console.log("error sent:", error.message);
                      });
                }
              });
        }
    })
  });