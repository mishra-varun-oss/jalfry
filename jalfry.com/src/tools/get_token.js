const jwt = require("jsonwebtoken");

require('dotenv').config({ path: "/var/www/jalfry.com/cred.env" });

module.exports.generate_token = (user) => {
	return jwt.sign(user, process.env.SECRET, { expiresIn: '1h' });
}
