const express = require("express");
const router = express.Router();
const { Comment, validate } = require("../models/comment");
const { User } = require("../models/user");
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");

const email = "trackexpenses07@gmail.com";
const pass = process.env.password;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});

router.post("/", auth, async (req, res) => {
  try {
    const id = req.user._id;
    const { error } = validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }
    const user = await User.findOne({ _id: id });
    const comment = new Comment({
      message: req.body.message,
      User: id,
      UserName: user.name,
    });
    const result = await comment.save();


      const CommentNotification = {
        from: '"Track Your Expenses" <trackexpenses07@gmail.com>',
        to: "jakimdavy07@gmail.com",
        subject: "Comment notification",
        html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Comment Notification</h2>
                <p>Hello, <strong>${user.name}</strong> just sent a comment.</p>
                <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
                  <p><strong>Comment content:</strong></p>
                  <p>${result.message}</p>
                </div>
                <p>Best regards,<br>Track Your Expenses Team</p>
              </div>
            `,
      };

      transporter.sendMail(CommentNotification, (error, info) => {
        if (error) {
          const failed = {
            from: email,
            to: "trackexpenses08@gmail.com",
            subject: "Commenting failed",
            html: `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #FF0000;">Commenting Failed</h2>
                    <p>Hi dev, debug your code. The comment function failed with the following error message:</p>
                    <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
                      <p><strong>Error message:</strong></p>
                      <p>${error.message}</p>
                    </div>
                    <p>Best regards,<br>Track Your Expenses Team</p>
                  </div>
                `,
          };

          transporter.sendMail(failed, () => {
            console.log("Error sent:", error.message);
          });
        }
      });
    
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
