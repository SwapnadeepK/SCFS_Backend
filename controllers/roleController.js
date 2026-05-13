const { getRolesService, assignRoleService } = require("../services/userService.js");
const { pool } = require("../config/db.js");
// STATIC MENU MAP (can move to DB later)
const roleMenuMap = {
  VTU_ADMIN: [
  { name: "Dashboard", path: "/admin/dashboard" },

  { name: "Payments", path: "/admin/payments" },

  { name: "Fee Structures", path: "/admin/fee-structures",},

  { name: "Fee Approvals", path: "/admin/fee-approvals" },

  { name: "Reports", path: "/admin/reports" },

  { name: "Users", path: "/admin/users" },

  { name: "Roles", path: "/admin/roles" },

  { name: "Role Requests", path: "/admin/role-requests" },
],

  STUDENT: [
  { name: "Dashboard", path: "/student/dashboard" },

  { name: "My Fees", path: "/student/fees" },

  { name: "Pay Fees", path: "/student/pay-fee" },

  { name: "Transactions", path: "/student/transactions" },
],

  PRINCIPAL: [
    { name: "Dashboard", path: "/principal" },
    { name: "Students", path: "/principal/students" },
  ],

  PROFESSOR: [
    { name: "Dashboard", path: "/professor" },
  ],

  UNVERIFIED: [
    { name: "Request Role", path: "/request-role" }
  ]
};

const getRoles = async (req, res) => {
    try {
        const roles = await getRolesService();

        res.json({
            success: true,
            data: roles
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch roles"
        });
    }
};

const assignRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        await assignRoleService(userId, roleId);

        res.json({ message: "Role assigned successfully" });
    } catch (err) {
        res.status(500).json({ message: "Role assignment failed" });
    }
};

const getRoleMenu = async (req, res) => {
  try {
    const { role } = req.params;

    const menu = roleMenuMap[role];

    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this role",});
    }

    res.json(menu);
  } catch (err) {
    res.status(500).json({message: "Failed to fetch menu",});
  }
};

const getRequestableRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, role_name 
      FROM roles
      WHERE role_name IN ('STUDENT', 'PROFESSOR', 'PRINCIPAL')
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch requestable roles"
    });
  }
};

module.exports = { getRoles, assignRole, getRoleMenu, getRequestableRoles };