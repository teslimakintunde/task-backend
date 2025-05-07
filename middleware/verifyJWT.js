const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const accessToken = authHeader.split(" ")[1];
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.status(403).json({ message: "Invalid Token" });

    req.name = decoded.name;
    req.userId = decoded.userId; // Attach userId to request
    next();
  });
};

module.exports = verifyJWT;
