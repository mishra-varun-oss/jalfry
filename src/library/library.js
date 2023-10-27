const path = require("path");

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));

module.exports.get_names = (cb) => {
	var q = `SELECT username FROM users`;

	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		var list = [];

		rows.forEach((row) => {
			list.push(row.username);
		})

		cb(list);
	})
}

module.exports.get_users_mp = (cb) => {
	var q = `SELECT username FROM users WHERE mp_permission NOT IN ('', NULL)`;

	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		var list = [];

		rows.forEach((row) => {
			list.push(row.username);
		})

		cb(list);
	})
}
