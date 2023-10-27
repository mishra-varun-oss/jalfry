const path = require("path");

const db = require(path.join(__dirname, "./connect_jalfry.js"));
const pin = require(path.join(__dirname, "../tools/pin_generator.js"));
const add_pin = require(path.join(__dirname, "../tools/add_pin.js"));

module.exports.test = (pin, domain, callback) => {
	var q = `SELECT * FROM users WHERE mpengs_pin = '${pin}'`;

	db.query(q, (err, results, fields) => {
		if (err) throw err;
		callback(results);
	})
}

module.exports.cookie = (pin, domain, username, callback) => {
	var q = `SELECT ${domain} FROM pins WHERE username = '${username}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		console.log(results);
		console.log(pin);
		if (results[0][domain] == pin) {
			var obj = {
				status: true
			}
			
			var q = `SELECT ${domain} FROM users WHERE username = '${username}'`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				obj.permission = results[0][domain];
				obj.username = username;

				callback(obj);
			})
		} else {
			callback({ status: false });
		}
	})
/*
	if (domain == 'mountrook.com') {
		var q = `SELECT * FROM users WHERE mountrook_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;
			
			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].mr_permission,
					username: results[0].username
				}
				
				callback(obj);
			} else {
				callback({ status: false });
			}
		})
	} else if (domain == 'health.relentlesscomputing.com') {
		var q = `SELECT * FROM users WHERE relentless_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;

			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].rc_permission,
					username: results[0].username
				}
				
				callback(obj);
			} else {
				callback({ status: false });
			}
		})
	} else if ((domain == 'mpengs.nyc') || (domain == 'mpengs.com')) {
		var q = `SELECT * FROM users WHERE mpengs_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;
			
			console.log('from JF: ' + results);
//			callback(results);

			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].mp_permission,
					username: results[0].username
				}
				
				callback(obj);
			} else {
				callback({ status: false });
			}

		})
	} else if (domain == 'dripti.me') {
		var q = `SELECT * FROM users WHERE driptime_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;
			
//			callback(results);

			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].dt_permission,
					username: results[0].username
				}
				
				callback(obj);
			} else {
				callback({ status: false });
			}
		})
	} else if (domain == 'kalyah.com') {
		var q = `SELECT * FROM users WHERE keysue_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;

			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].ks_permission,
					username: results[0].username
				}

				callback(obj);
			} else {
				callback({ status: false });
			}
		})
	} else if (domain == 'mycivvi.com') {
		console.log('helloooooo');
		var q = `SELECT * FROM users WHERE mycivvi_pin = '${pin}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;

			if (results.length > 0) {
				var obj = {
					status: true,
					permission: results[0].mc_permission,
					username: results[0].username
				}

				callback(obj);
			} else {
				callback({ status: false });
			}
		})
	}
*/
}

module.exports.auth = (username) => {
	return new Promise(function(reject, resolve) {
		var q = `SELECT * FROM users WHERE username = '${username}'`;

		permissions = [];

		db.query(q, function(err, results, fields) {
			if (err) {
				return reject(err);
			}

			var permissions = [];

			if (results.length > 0) {
				if (results[0].mr_permission) {
					var mr_pin = pin.new_pin();

					var mr_obj = {
						domain: 'mountrook.com',
						uid: mr_pin
					}

					add_pin.add_pin(mr_pin, 'mountrook_pin', username);

					permissions.push(mr_obj);
				}

				if (results[0].rc_permission) {
					var rc_pin = pin.new_pin();

					var rc_obj = {
						domain: 'health.relentlesscomputing.com',
						uid: rc_pin
					}
					
					add_pin.add_pin(rc_pin, 'relentless_pin', username);

					permissions.push(rc_obj);
				}

				if (results[0].mp_permission) {
					var mp_pin = pin.new_pin();

					var mp_obj = {
						domain: 'mpengs.nyc',
						uid: mp_pin
					}

					var mp_com_obj = {
						domain: 'mpengs.com',
						uid: mp_pin
					}
					
					add_pin.add_pin(mp_pin, 'mpengs_pin', username);

					permissions.push(mp_obj);
					permissions.push(mp_com_obj);
				}

				resolve(permissions);
			} else {
				resolve([]);
			}
		})
	})
}
