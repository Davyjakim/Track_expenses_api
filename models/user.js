const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

// define the shape of the course in the database
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    match: /@/,
    require: true,
    minlength: 5,
  },
  password: {
    type: String,
    require: true,
    minlength: 5,
  },
  isAdmin: { type: Boolean, default: false },
});

UserSchema.methods.generateAuthToken = function () {
  return (token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email:this.email,
      isAdmin: this.isAdmin,
    },
    config.get("keyforauth")
  ));
};
const User = mongoose.model("Users", UserSchema);

function validate(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validate;
