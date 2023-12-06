const path = require('path');
const jwt = require("jsonwebtoken");
const configs = require(path.join(__dirname, "./configs.js"));

require("dotenv").config(configs.tools_config_obj);

module.exports.generate_token = (user) => {
	return jwt.sign(user, process.env.JWT_TOKEN_SECRET , { expiresIn: '1h' });
}
