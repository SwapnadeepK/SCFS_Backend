const express = require("express");
const router = express.Router();

const { login, signup } = require("../controllers/authController.js");

router.post("/login", login);     //LOgin route
router.post("/register", signup); //Signup route  

module.exports = router;