const express = require("express");
const router = express.Router();

const { registerStudent } = require("../controllers/studentController.js");

router.post("/register", registerStudent);

module.exports = router;