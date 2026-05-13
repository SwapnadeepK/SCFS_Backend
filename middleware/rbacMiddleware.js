const { pool } = require("../config/db.js");

const getAllRoleIds = async (roleId) => {
    const visited = new Set();
    const stack = [roleId];

    while (stack.length) {
        const current = stack.pop();
        if (visited.has(current)) continue;

        visited.add(current);

        const [rows] = await pool.query(`
            SELECT child_role_id FROM role_hierarchy WHERE parent_role_id = ?
        `, [current]);

        rows.forEach(r => stack.push(r.child_role_id));
    }

    return Array.from(visited);
};

const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      // console.log("REQ USER:", req.user); // 🔍 DEBUG

      const roleIds = await getAllRoleIds(req.user.role_id);

      // console.log("ROLE IDS:", roleIds); // 🔍 DEBUG

      const [rows] = await pool.query(`
        SELECT DISTINCT p.permission_name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id IN (?)
      `, [roleIds]);

      const permissions = rows.map(r => r.permission_name);

      // console.log("PERMISSIONS:", permissions); // 🔍 DEBUG
      console.log("REQUIRED:", permission);     // 🔍 DEBUG

      if (!permissions.includes(permission)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "RBAC hierarchy error" });
    }
  };
};

module.exports = { authorize };