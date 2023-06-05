const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // if token is not present (not logged in)

  if (!config.get("requiresAuth")) return next();

  let token = req.header("Authorization");
  if (!token || !token.startsWith("Bearer "))
    return res.status(401).send("Access denied. No token provided.");
  
  token = token.substring(7);

  try {
    // this returns the payload defined on the generateAuthToken()
    const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decodedPayload;

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
