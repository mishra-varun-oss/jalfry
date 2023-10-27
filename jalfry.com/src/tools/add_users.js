const path = require("path");

const db = require(path.join(__dirname, "./connect_jalfry.js"));

module.exports.add_user = (username, password, domain, role) => {
	return new Promise((resolve, reject) => {
		var q = `INSERT INTO users (username, password, ${domain}_permission) VALUES ('${username}', '${password}', '${role}')`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;
			console.log(results);

			resolve({ success: 'done!' });
		})
	})
}
