const express = require("express");
const router = express.Router();
const { MonthlyExpense, validate } = require("../models/monthlyExpense");
const { auth } = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const id = req.user._id;
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  const monthlyExpense = new MonthlyExpense({
    date: Date.now(),
    currency: req.body.currency,
    rent: req.body.rent,
    gym: req.body.gym,
    entertainment: req.body.entertainment,
    other: req.body.other,
    User: id,
  });
  const result = await monthlyExpense.save();
  res.send(result);
});

router.get("/", auth, async (req, res) => {
  const monthlyExpenses = await MonthlyExpense.find().sort("_id");
  res.send(monthlyExpenses);
});

module.exports = router;
