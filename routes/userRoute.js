const express = require("express");
const {
  registerNewUser,
  handleLogin,
  handleRefreshToken,
  handleLogOut,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerNewUser);
router.post("/login", handleLogin);
router.get("/refresh", handleRefreshToken);
router.post("/logout", handleLogOut);

module.exports = router;
