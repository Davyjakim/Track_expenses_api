const jwt = require("jsonwebtoken");
const config = require("config");

function Admin(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("access denied. No token provided");
  try {
    const decoded = jwt.verify(token, config.get("keyforauth"));
    const { isAdmin } = decoded;

    if(isAdmin){
        req.user = decoded;
        next();
    }else{
        res.status(403).send("Forbidden")
    }
  } catch (e) {
    res.status(400).send("Invalid token");
  }
}

module.exports.Admin = Admin;
