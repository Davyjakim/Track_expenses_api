const mongoose = require("mongoose");
const Joi = require("joi");
const {User}= require('./user')

const weeklyExpenseSchema = new mongoose.Schema({

  startdate: { type: Date, required:true },
  isExpenseOpen:{type: Boolean, required: true},
  enddate: Date,
  currency: { type: String },
  startingFunds: Number,
  endingFunds:Number,
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});

const WeeklyExpense = mongoose.model("weeklyExpenses", weeklyExpenseSchema);

function validate(expenses) {
  const Schema = Joi.object({
    currency: Joi.string(),
    startingFunds: Joi.number().min(0),
    endingFunds: Joi.number().min(0),
  });
  return Schema.validate(expenses);
}

exports.WeeklyExpense = WeeklyExpense;
exports.validate = validate;