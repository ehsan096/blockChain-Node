const jwt = require("jsonwebtoken");
const config = require("config");
const Users = require("../routes/api/users");
function auth(req, res, next) {
  let token = req.header("x-auth-token");
  if (!token) return res.status(400).send("Token Not Provided");
  try {
    let user = jwt.verify(token, config.get("jwtPrivateKey"));
    Users.map((usr) => (usr.id === user.id ? (req.user = usr) : null));
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  next();
}
module.exports = auth;
