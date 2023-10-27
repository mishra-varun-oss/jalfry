const crypto = require("crypto");
const argon2 = require("argon2");

module.exports.hash_password = function(password) {
	return new Promise((resolve, reject) => {
		try {
			let sha256 = crypto.createHash("sha256");
			let sha256_hash = sha256.update(password).digest("base64");

//			console.log(sha256_hash);
			argon2.hash(sha256_hash).then(hash => {
				resolve(hash)
			})
		} catch (error) {
			reject(error)
		}
	})
}
