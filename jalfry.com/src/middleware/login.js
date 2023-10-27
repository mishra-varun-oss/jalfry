const path = require("path");
const crypto = require("crypto");

const argon2 = require("argon2");

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const pin = require(path.join(__dirname, "../tools/pin_generator.js"));
const add_pin = require(path.join(__dirname, "../tools/add_pin.js"));

const views_route = '/var/www/jalfry.com/templates/views/';

module.exports.access_pass = (req, res, next) => {
	const username = req.body.username;
	let q = `SELECT * FROM users WHERE username = '${username}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		
		if (results.length > 0) {
			req.session.loggedin = true;
			req.session.username = username;
			next();
		} else {
			res.clearCookie('auth', { sameSite: 'None', secure: true, domain: 'jalfry.com' });
			res.redirect('/');
		}
	})
}

module.exports.access = (req, res, next) => {
	const username = req.body.user;
	const password = req.body.pass;
	let q = `SELECT * FROM users WHERE username = '${username}'`; 
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			if (results[0].password == password) {
				req.session.loggedin = true;
				req.session.username = username;
				let user = {
					username: username,
					login_status: true
				}
				res.cookie('auth', user, { expires: new Date(Date.now() + 900000), sameSite: 'None', secure: true, domain: 'jalfry.com' });
				next();
			} else {
				res.render("index", {
					message: "Username or password is incorrect!"
				})
			}
		} else {
			res.render("index", {
				message: "Username not registered! Please register or try different username..."
			})
		}
	})
}

module.exports.admin = (req, res, next) => {
	const user = req.body.user;
	const password = req.body.pass;

	const q = `SELECT * FROM admins WHERE username = '${user}'`; 

	let sha256 = crypto.createHash("sha256");
	let sha256_hash = sha256.update(password).digest("base64");

	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			const hashed_key = results[0].password;
			
			argon2.verify(hashed_key, sha256_hash)
			.then((correct) => {
				if (correct) {
					console.log(req.body);
					req.session.loggedin = true;
					req.session.username = user;
					req.session.approval_status = results[0].approval_status;
					
					next();
				} else {
					res.render("admin_login", {
						message: "Wrong password! Please try again..."
					})
				}
			})
		} else {
			res.render("admin_login", {
				message: "Username not registered! Please register or try different username..."
			})
		}
	})
}

module.exports.quick_login = (req, res, next) => {
	var username = req.body.user;
	var o = req.body.ref;

	var d = o.domain;

	var q = `SELECT ${d} FROM pins WHERE username = '${username}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		console.log(results);

		if (results[0][d]) {
			req.session.using_pin = results[0][d];

			next();
		} else {
			var new_pin = pin.new_pin();
			add_pin.add_pin(new_pin, `${o.domain}`, username);
			
			req.session.using_pin = new_pin;	

			next();
		}
	})
}

module.exports.login = (req, res, next) => {
	let username = req.body.user;
	let password = req.body.pass;
	let uid = req.body.uid;
	let phone = req.body.phone;
	let code = req.body.code;
	let o = req.body.ref;
/*	
	let q = `SELECT * FROM login_codes WHERE uid = '${uid}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			let c = results[0].code;
			if (c == code) {
				let q = `SELECT * FROM users WHERE phone_number = '${phone}'`;
				db.query(q, (err, results) => {
					if (err) throw err;
					
					let username = results[0].username;
					let user = {
						username: username,
						login_status: true
					}
					res.cookie('auth', user, { expires: new Date(Date.now() + 900000), sameSite: 'None', secure: true, domain: 'jalfry.com' });
					let d = o.domain;
					let q = `SELECT ${d} FROM users WHERE username = '${username}'`;
					db.query(q, (err, results, fields) => {
						if (err) throw err;

						if (results[0][d]) {
							let new_pin = pin.new_pin();
							add_pin.add_pin(new_pin, `${d}`, username);
							req.session.using_pin = new_pin;	
							
							next();
						} else {
							res.send({ status: false, message: `You do not have access to ${o.domain} :(` });
						}
					})
				})
			} else {
				res.send({ status: false, message: "Code doesn't match. Try again" });
			}
		} else {
			res.send({ status: false, message: 'There was an error. Try again' });
		}
	})*/

	var q = `SELECT * FROM users WHERE username = '${username}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			if (password == results[0].password) {
				var user = {
					username: username,
					login_status: true
				}
				res.cookie('auth', user, { expires: new Date(Date.now() + 900000), sameSite: 'None', secure: true, domain: 'jalfry.com' });

				var d = o.domain;

				var q = `SELECT ${d} FROM users WHERE username = '${username}'`;

				db.query(q, (err, results, fields) => {
					if (err) throw err;

					if (results[0][d]) {
						var new_pin = pin.new_pin();
						add_pin.add_pin(new_pin, `${o.domain}`, username);

						req.session.using_pin = new_pin;	
						
						next();
					} else {
						res.send({ status: false, message: `You do not have access to ${o.domain} :(` });
					}
				})
			} else {
				res.send({ status: false, message: 'Wrong password or username, please try again...' });
			}
		} else {
			res.send({ status: false, message: 'You are not registered with jalfry!' });
		}
	})	

}

module.exports.approval_check = (req, res, next) => {
	let o = req.body.ref;
	let domain = o.domain;
	let phone = req.body.phone;
	let q = `SELECT approved FROM users WHERE phone_number = '${phone}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			if (results[0].approved === 'true') {
				next();
			} else if (results[0].approved === 'false') {
				res.send({ success: false, message: `You have not been approved to access ${domain} yet.` });
			}
		} else {
			res.send({ success: false, message: `You are not registered with jalfry!` });
		}
	})
}
	
