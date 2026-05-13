// require("dotenv").config();
// const bcrypt = require("bcrypt");
// const { pool } = require("../config/db.js");

// const resetPassword = async () => {
//     const email = "admin@vtu.ac.in";
//     const newPassword = "Admin@123";

//     const hashed = await bcrypt.hash(newPassword, 10);

//     await pool.query(
//         "UPDATE users SET password_hash = ? WHERE email = ?",
//         [hashed, email]
//     );

//     console.log("Password updated successfully");
//     process.exit();
// };

// resetPassword();

// Use this code only for resetting the password of the admin user. Make sure to change the email and newPassword variables as needed. 
// After running this script, the admin user's password will be updated to the new password specified.