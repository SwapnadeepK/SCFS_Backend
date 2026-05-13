const { registerStudentService } = require("../services/studentService.js");

const registerStudent = async (req, res) => {
    const userId = await registerStudentService(req.body);
    res.status(201).json({ message: "Student registered. Awaiting approval.", userId });
};

module.exports = { registerStudent };