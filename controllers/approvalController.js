const {
    approveUser,
    approveStudent,
    approveFee,
    approveRoleRequest
} = require("../services/approvalService.js");

// Approve User
const approveUserController = async (req, res) => {
    await approveUser(req.params.id, req.user.id);
    res.json({ message: "User approved" });
};

// Approve Student
const approveStudentController = async (req, res) => {
    await approveStudent(req.params.id, req.user.id);
    res.json({ message: "Student approved" });
};

// Approve Fee
const approveFeeController = async (req, res) => {
    await approveFee(req.params.id, req.user.id);
    res.json({ message: "Fee approved" });
};

// Approve Role Request
const approveRoleRequestController = async (req, res) => {
    await approveRoleRequest(req.params.id, req.user.id);
    res.json({ message: "Role request approved" });
};

module.exports = {
    approveUserController,
    approveStudentController,
    approveFeeController,
    approveRoleRequestController
};