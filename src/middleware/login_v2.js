const path = require("path");

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const pin = require(path.join(__dirname, "../tools/pin_generator.js"));
const add_pin = require(path.join(__dirname, "../tools/add_pin.js"));

const views_route = '/var/www/jalfry.com/templates/views/';

module.exports.login = (username, password, domain) => {
	return new Promise((resolve, reject) => {
		var obj = {
			status: false
		}

		var q = `SELECT * FROM users WHERE username = '${username}'`;
		db.query(q, (err, results, fields) => {
			if (err) {
				return reject(rows);
			}

			if (results.length > 0) {
				if (results[0].password == password) {
					obj.status = true;

					if (domain == 'mountrook.com') {
						if (results[0].mr_admin == 1) {
							obj.permission = 'admin';
							resolve(obj);
						} else if (results[0].mr_user == 1) {
							obj.permission = 'user';
							resolve(obj);
						}
					} else if (domain == 'relentlescomputing.com') {
						if (results[0].rc_admin == 1) {
							obj.permission = 'admin';
							resolve(obj);
						} else if (results[0].rc_doctor == 1) {
							obj.permission = 'doctor';
							resolve(obj);
						}
					} else if (domain == 'mpengs.nyc') {
						if (results[0].mp_admin == 1) {
							obj.permission = 'admin';
							resolve(obj);
						} else if (results[0].mp_employee) {
							obj.permission = 'employee';
							resolve(obj);
						}
					}
				} else {
					resolve(obj);
				}
			} else {
				obj.status = 'not registered';
				resolve(obj);
			}
		})
	})
}
