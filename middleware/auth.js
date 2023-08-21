const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (!config.get("REQUIRES_AUTH")) return next();

  let token = req.header("Authorization");
  if (!token || !token.startsWith("Bearer "))
    return res.status(401).send("Access denied. No token provided.");

  token = token.substring(7);

  try {
    // this returns the payload defined on the generateAuthToken()
    const privateKey = `-----BEGIN PUBLIC KEY-----\n${config.get("JWT_PRIVATE_KEY")}\n-----END PUBLIC KEY-----`;
    const options = {
      algorithms: ["RS256"],
    };
    const decodedPayload = jwt.verify(
      token,
      privateKey,
      options
    );
    console.log("decodedPayload", decodedPayload);
    req.user = decodedPayload;

    next();
  } catch (ex) {
    res.status(400).send(`${ex.message.toUpperCase()}.`);
  }
};