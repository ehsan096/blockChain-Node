const jwt = require("jsonwebtoken");
const config = require("config");
const Users = require("../routes/api/users");
function auth(req, res, next) {
  let token = req.header("x-auth-token");
  if (!token) return res.status(400).send("Token Not Provided");
  try {
    let user = jwt.verify(token, config.get("jwtPrivateKey"));
    console.log(user);
    req.user = user;
    // Users.map((usr) => (usr.id === user.id ? (req.user = usr) : null));
  } catch (err) {
    console.log("Error, ", err);
    return res.status(401).send("Invalid Token");
  }
  next();
}
module.exports = auth;
