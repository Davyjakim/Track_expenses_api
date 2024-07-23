require('express-async-errors')
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');



const app = express();
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

require('./routes/scheduler')
require("./startup/routes")(app);
require('./startup/db')()
require("./startup/config")();


 
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

module.exports = server;
