const path = require('path');

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));

module.exports.add_pin = (pin, domain, username) => {
	var q = `UPDATE pins SET ${domain} = '${pin}' WHERE username = '${username}'`;

	db.query(q, (err, results, fields) => {
		if (err) throw err;
	})
}
