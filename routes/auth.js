const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email ");
  //   user = new Users({
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //   });

  const isvalidpass = await bcrypt.compare(req.body.password, user.password);
  if (!isvalidpass) {
    return res.status(400).send("Invalid password");
  }

  const token = user.generateAuthToken();
  res.send(token);
});

router.post("/validateToken", async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("access denied. No token provided");
  try {
    const decoded = jwt.verify(token, process.env.TrackExpense_jwtPrivateKey);
    if (decoded) {
      return res.send({ valid: true });
    } else {
      return res.send({ valid: false });
    }
  } catch (e) {
    return res.status(400).send(e);
  }
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });
  return schema.validate(user);
}

module.exports = router;
