const express = require("express");
const error = require('../middleware/error')
const monthlyexpenses = require("../routes/monthlyExpenses")
const weeklyExpense = require("../routes/weeklyExpense")
const previewExpenses= require("../routes/previewExpenses")
const auth = require("../routes/auth");
const users= require("../routes/user")
module.exports = function (app) {
    app.use(express.json());
    app.use("/monthlyexpenses", monthlyexpenses);
    app.use("/weeklyexpenses", weeklyExpense);
    app.use("/weeklyexpenses/preview", previewExpenses);
    app.use("/users", users);
    app.use("/auth", auth);
    app.use(error)
  };
  