const express = require("express");
const router = express.Router();
const { MonthlyExpense } = require("../models/monthlyExpense");
const { WeeklyExpense } = require("../models/weeklyExpense");
const { auth } = require("../middleware/auth");

const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  PLN: 4.4,
};

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(
      `Invalid currency or missing exchange rate for ${fromCurrency} or ${toCurrency}`
    );
  }

  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return Math.round(convertedAmount * 100) / 100;
}

router.get("/recent_monthExpenses/:startdate/:enddate/:currency", auth, async (req, res) => {
  const desiredCurrency = req.params.currency;
  const startdate = new Date(req.params.startdate);
  const enddate = new Date(req.params.enddate);
  

  const monthlyExpenses = await MonthlyExpense.find({
    User: req.user._id,
    date: {
      $gte: startdate,
      $lte: enddate
    }
  }).sort("_id");
  
  if (monthlyExpenses.length === 0) {
    return res.status(404).send({ error: 'No expenses found for the given date range' });
  }
  
  const { currency, rent, gym, entertainment, other,date } = monthlyExpenses[0];
  const ress = rent + gym + entertainment + other;
  console.log("actual date",date);
  const total = convertCurrency(ress, currency, desiredCurrency, exchangeRates);
  res.send({ total, desiredCurrency });
});

router.get(
  "/weeklyExpense_with_in_TimeFrame/:startdate/:enddate/:currency",
  auth,
  async (req, res) => {
    try {
      const startdate = new Date(req.params.startdate);
      const enddate = new Date(req.params.enddate);
      const desiredCurrency = req.params.currency;

      if (startdate >= enddate) {
        return res
          .status(400)
          .send({ error: "Start date should be earlier than end date" });
      }

      const weeklyExpense = await WeeklyExpense.find({
        startdate: { $gte: startdate },
        enddate: { $lte: enddate },
        isExpenseOpen: false,
        User: req.user._id,
      }).select("startdate enddate endingFunds currency startingFunds");

      const expenses = weeklyExpense.map((expense) => ({
        startdate: expense.startdate.toISOString().split("T")[0],
        enddate: expense.enddate.toISOString().split("T")[0],
        amountspent: convertCurrency(
          expense.startingFunds - expense.endingFunds,
          expense.currency,
          desiredCurrency,
          exchangeRates
        ),
        currency: desiredCurrency,
      }));
      res.send(expenses);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

module.exports = router;
