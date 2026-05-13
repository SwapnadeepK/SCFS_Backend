const { v4: uuidv4 } = require("uuid");

const generateUUID = () => uuidv4();

const toBinaryUUID = (uuid) => {
    return Buffer.from(uuid.replace(/-/g, ""), "hex");
};

module.exports = { generateUUID, toBinaryUUID };