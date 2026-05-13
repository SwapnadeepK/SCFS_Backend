const express = require("express");
const router = express.Router();

const {
    approveUserController,
    approveStudentController,
    approveRoleRequestController
} = require("../controllers/approvalController.js");

const {
    rejectUser,
    rejectRoleRequest
} = require("../services/rejectionService.js");

const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

// APPROVALS

router.post(
    "/user/:id/approve",
    authenticate,
    authorize("APPROVE_USER"),
    approveUserController
);

router.post(
    "/student/:id/approve",
    authenticate,
    authorize("APPROVE_STUDENT"),
    approveStudentController
);

router.post(
    "/role-request/:id/approve",
    authenticate,
    authorize("APPROVE_ROLE"),
    approveRoleRequestController
);

// REJECTIONS

router.post(
    "/user/:id/reject",
    authenticate,
    authorize("APPROVE_USER"),
    async (req, res) => {
        await rejectUser(req.params.id);
        res.json({ message: "User rejected" });
    }
);

router.post(
    "/role-request/:id/reject",
    authenticate,
    authorize("APPROVE_ROLE"),
    async (req, res) => {
        await rejectRoleRequest(req.params.id);
        res.json({ message: "Role request rejected" });
    }
);

module.exports = router;