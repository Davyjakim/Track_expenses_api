const mongoose = require("mongoose");
const config = require('config')

module.exports= function(){
  const db = process.env.db_url
    mongoose
  .connect(db)
  .then(() => {
    console.log(`Connected to ${db}...`);
  })
}