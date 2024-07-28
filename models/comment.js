const mongoose = require("mongoose");
const Joi = require("joi");

const CommentSchema = new mongoose.Schema({
  
  Id: mongoose.Schema.Types.ObjectId ,
  message: { type: String, required: true },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  UserName:{type: String}
});

const Comment = mongoose.model("Comment", CommentSchema);

function validate(Comment) {
  const Schema = Joi.object({
    message: Joi.string().required(),
  });
  return Schema.validate(Comment);
}

exports.Comment = Comment;
exports.validate = validate;
