const path = require("path");
const jwt = require("jsonwebtoken");

const auth = require(path.join(__dirname, "../tools/authentication.js"));
const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));

module.exports.token = (req, res, next) => {
	var d = req.body.domain;
	var s = req.body.secret;
	var t = req.body.token;
	var u = req.body.username;

	if (s) {
		jwt.verify(t, s, (err, decoded) => {
			if (err) {
				res.send({ status: false });
				console.log(err);
			}

			var p = decoded.pin;

			auth.cookie(p, d, u, (results) => {
				console.log(results);
				if (results.status) {
					console.log(req.headers.referer);
					res.send({
						username: results.username,
						permission: results.permission,
						status: true
					})
				} else {
					next();
				}
			})
		})
	} else {
		var q = `SELECT secret FROM domains WHERE domain = '${d}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			s = results[0].secret;
			jwt.verify(t, s, (err, decoded) => {
				if (err) {
					res.send({ status: false });
					console.log(err);
				}

				var p = decoded.pin;

				auth.cookie(p, d, u, (results) => {
					console.log(results);
					if (results.status) {
						console.log(req.headers.referer);
						res.send({
							username: results.username,
							permission: results.permission,
							status: true
						})
					} else {
						next();
					}
				})
			})
		})
	}
}

module.exports.verify = (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	var q = `SELECT * FROM users WHERE username = '${username}'`;

	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			if (results[0].password == password) {
				next();
			} else {
				var obj = {
					login_status: false
				}

				res.send(obj);
			}
		} else {
			var obj = { 
				login_status: false
			}

			res.send(obj);
		}
	})
}

module.exports.permissions = (req, res, next) => {
	const username = req.body.username;

	var q = `SELECT * FROM users WHERE username = '${username}'`;

	db.query(q, (err, results, fields) => {
		if (err) throw err;

		var obj = {
			login_status: true,
			rc_admin: results[0].rc_admin,
			rc_doctor: results[0].rc_doctor,
			mr: results[0].mr,
			mp_admin: results[0].mp_admin,
			mp_employee: results[0].mp_employee
		}

		res
			.cookie('mpengs', `${obj.mp_admin}, ${obj.mp_employee}`, { domain: 'mpengs.nyc', maxAge: 900000 })
			.cookie('mountrook', `${obj.mr}`, { domain: 'mountrook.com', maxAge: 900000 })

		console.log("cookies setting...");
//		res.send(obj);
		
//		res.cookie("username", obj, { maxAge: 9000000, SameSite: 'None' });
	})
}
