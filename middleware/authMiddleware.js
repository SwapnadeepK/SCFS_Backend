const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 IMPORTANT: normalize user object
    req.user = {
      id: decoded.id,
      role: decoded.role,
      role_id: decoded.role_id   // 🔥 MUST EXIST
    };

    // console.log("AUTH USER 👉", req.user); // DEBUG

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };