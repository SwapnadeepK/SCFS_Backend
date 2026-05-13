require("dotenv").config();

const config = {
    port: process.env.PORT || 5000,

    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: "1d"
    }
};

module.exports = { config };