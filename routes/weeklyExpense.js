const express = require("express");
const router = express.Router();
const { WeeklyExpense, validate } = require("../models/weeklyExpense");
const {auth} = require('../middleware/auth')


router.post("/",auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  const weeklyExpense = new WeeklyExpense({
    startdate: Date.now(),
    isExpenseOpen: true,
    currency: req.body.currency,
    startingFunds: req.body.startingFunds,
    User: req.user._id
  });
  const result = await weeklyExpense.save();
  res.send(result);
  console.log(result);
});

router.get("/",auth, async (req, res) => {
  const weeklyExpense = await WeeklyExpense.find({User: req.user._id}).sort("_id");
  res.send(weeklyExpense);
});
router.get("/startdate",auth, async (req, res) => {
    const weeklyExpense = await WeeklyExpense.findOne({isExpenseOpen:true, User:req.user._id});
    if(!weeklyExpense) return res.send("No expense is open")

    const results = {
        startdate:weeklyExpense.startdate,
        isExpenseOpen: weeklyExpense.isExpenseOpen,
        currency:weeklyExpense.currency
    }
    res.send(results);
  });

router.put("/",auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  const weeklyExpense = await WeeklyExpense.findOne({ isExpenseOpen: true,  User:req.user._id });
  if (!weeklyExpense) return res.status(404).send("there is no expense open");
  weeklyExpense.endingFunds = req.body.endingFunds;
  weeklyExpense.isExpenseOpen = false;
  weeklyExpense.enddate = Date.now();
  const results = await weeklyExpense.save();
  console.log(results);
  res.send(results);
});

module.exports = router;
