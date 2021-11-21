var express = require("express");
var router = express.Router();

var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../../users/users");
const config = require("config");

// console.log(Users);
router.post("/login", async (req, res) => {
  let loggedIn = null;
  Users.map((user) =>
    req.body.email === user.email ? (loggedIn = user) : null
  );
  console.log(loggedIn);
  if (!loggedIn) {
    return res.status(400).send("User Not Registered");
  } else {
    let isValid = await bcrypt.compare(req.body.password, loggedIn.password);
    if (!isValid) return res.status(401).send("Invalid Password");
    let token = jwt.sign(
      { id: loggedIn.id, name: loggedIn.name, role: loggedIn.role },
      config.get("jwtPrivateKey")
    );
    res.send(token);
  }
});

module.exports = router;
