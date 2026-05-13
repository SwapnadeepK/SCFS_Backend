const { createStaff } = require("../services/staffService.js");

const createStaffController = async (req, res) => {
    const id = await createStaff(req.body);
    res.status(201).json({ message: "Staff created", id });
};

module.exports = { createStaffController };