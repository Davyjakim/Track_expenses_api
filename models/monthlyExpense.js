const mongoose = require("mongoose");
const Joi = require("joi");
const {User}= require('./user')

const monthlyExpenseSchema = new mongoose.Schema({
  
  date: { type: Date, default: Date.now },
  currency: { type: String, required: true },
  rent: { type: Number, required: true },
  gym: { type: Number, required: true },
  entertainment: { type: Number, required: true },
  other: { type: Number, required: true },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});

const MonthlyExpense = mongoose.model("MonthlyExpenses", monthlyExpenseSchema);

function validate(expenses) {
  const Schema = Joi.object({
    date: Joi.date(),
    currency: Joi.string().required(),
    rent: Joi.number().min(0).required(),
    gym: Joi.number().min(0).required(),
    entertainment: Joi.number().min(0).required(),
    other: Joi.number().min(0).required(),
  });
  return Schema.validate(expenses);
}

exports.MonthlyExpense = MonthlyExpense;
exports.validate = validate;
