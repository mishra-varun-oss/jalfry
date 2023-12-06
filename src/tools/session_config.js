const path = require('path');

const configs = require(path.join(__dirname, "./configs.js"));

require("dotenv").config(configs.tools_config_obj);

module.exports.session_config = { 
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}
