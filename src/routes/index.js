const path = require("path");
const express = require("express");

const jwt = require("jsonwebtoken");
const cors = require("cors");

const router = express.Router();

const views_route = '/var/www/jalfry.com/templates/views/';

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const auth = require(path.join(__dirname, "../services/authenticate.js"));
const pin = require(path.join(__dirname, "../tools/pin_generator.js"));
const add_pin = require(path.join(__dirname, "../tools/add_pin.js"));
const token = require(path.join(__dirname, "../tools/get_token.js"));
const cookie = require(path.join(__dirname, "../middleware/cookie.js"));
const login = require(path.join(__dirname, "../middleware/login.js"));
const reg = require(path.join(__dirname, "../services/register.js"));

require("dotenv").config(__dirname, "../../cred.env");

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

var corsOptions = {
	origin: function (origin, callback) {
		console.log(origin);
		var o = origin.split("https://")[1];
		var h = o.split(".")[0];
		var rel = o.split(".")[1];
		var q = `SELECT domain FROM domains`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			let d = '';

			results.forEach((result) => {
				d += `${result.domain} `;
			})

			if ((d.includes(h)) || (d.includes(rel))) {
				console.log('hello');
				console.log(h);
				callback(null, { origin: true });
			} else if (origin.includes("https://files.mpengs.com")) {
				callback(null, { origin: true });
			} else if (origin.includes("cozytables")) {
				console.log('cozy!!!');
				callback(null, { origin: true });
			} else if (origin.includes("strategy.mpengs")) {
				callback(null, { origin: true });
			} else if (origin.includes("mountrook.com")) {
				callback(null, { origin: true });
			} else {
				console.log('no', h);
				callback(null, { origin: false });
			}
		})
	}	
}

router.get("/", (req, res) => {
	res.render(views_route + "index.hbs")
})

router.get("/auth", cookie.check, (req, res) => {
	var referer = req.headers.referer + 'login';
	
	res.render(views_route + 'login.hbs');
})

router.get("/sso", (req, res) => {
	res.render(views_route + 'sso.hbs');
})

router.post("/login/pass", login.quick_login, (req, res) => {
	var obj = {
		pin: req.session.using_pin,
	}

	if (req.body.ref.token_secret) {
		const token = jwt.sign(obj, req.body.ref.token_secret, { expiresIn: '1h' });
		res.send({ status: true, token });
	} else {
		var q = `SELECT secret FROM domains WHERE domain = '${req.body.ref.domain}'`;

		db.query(q, (err, results, fields) => {
			if (err) throw err;

			const token = jwt.sign(obj, results[0].secret, { expiresIn: '1h' });
			res.send({ status: true, token });
		})
	}

})

router.post("/login", login.login, (req, res) => {
	var obj = {
		pin: req.session.using_pin,
	}
	
	if (req.body.ref.token_secret) {
		const token = jwt.sign(obj, req.body.ref.token_secret, { expiresIn: '1h' });
		res.send({ status: true, token });
	} else {
		var q = `SELECT secret FROM domains WHERE domain = '${req.body.ref.domain}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;
//			console.log(q);
			let s = results[0].secret;

			let username = req.body.user;
			const token = jwt.sign(obj, s, { expiresIn: '1h' });
			res.send({ status: true, token, username });
		})
	}

})

router.get('/register', (req, res) => {
	res.render('register');
})

router.post('/register', (req, res) => {
	let role = req.body.role;
	let username = req.body.username;
	let password = req.body.password;
	let phone_number = req.body.phone_number;
	let domain = req.body.domain;
	let q = `SELECT approval_required FROM domains WHERE domain = '${domain}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results[0].approval_required === 'Yes') {
			let q = `INSERT INTO users(id, username, password, phone_number, approved, ${domain}) VALUES (default, '${username}', '${password}', '${phone_number}', 'false', '${role}')`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				res.send({ approved: false });
			})
		} else if (results[0].approval_required === 'No') {
			let q = `INSERT INTO users(id, username, password, phone_number, approved, ${domain}) VALUES (default, '${username}', '${password}', '${phone_number}', 'true', '${role}')`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				let q = `INSERT INTO pins (username) VALUES ('${username}')`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;

					res.send({ approved: true });
				})
			})
		}
	})
})

router.get('/forgot_password', (req, res) => {
	res.render('forgot_password');
})

router.post('/number', login.approval_check, (req, res) => {
	console.log('hellooo');
	let n = req.body.phone;
	let q = `SELECT * FROM users WHERE phone_number = '${n}'`;
	db.query(q, (err, results) => {
		if (err) throw err;

		if (results.length > 0) {
			let name = results[0].username;
			let date = new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-');
			let code = Math.floor(100000 + Math.random() * 900000);
			let uid = makeid(7);
			let q = `INSERT INTO login_codes VALUES (default, '${n}', '${code}', STR_TO_DATE('${date}', '%d-%m-%Y'), '${uid}')`;
			db.query(q, (err, results) => {
				if (err) throw err;

				twilio_client.messages.create({ 
					body: `Hi ${name}! Your jalfry login code is: ${code}`,
					from: '+19175408423',
					to: `+1${n}`
				})
				.then((message) => {
					res.send({ success: true, uid: uid });
				})
			})
		} else {
			res.send({ success: false, message: "This number is not registered with us. Please create new account." });
		}
	})
})

router.post('/forgot_password/number', (req, res) => {
	let n = req.body.phone_number.split(' ').join('');
	let q = `SELECT * FROM users WHERE phone_number = '${n}'`;
	db.query(q, (err, results) => {
		if (err) throw err;

		if (results.length > 0) {
			let code = Math.floor(100000 + Math.random() * 900000);
			let date = new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-');
			let name = results[0].username;
			let q = `INSERT INTO forgot_password VALUES (default, '${results[0].phone_number}', '${code}', STR_TO_DATE('${date}', '%d-%m-%Y'))`;
			db.query(q, (err, results) => {
				if (err) throw err;

				twilio_client.messages.create({ 
					body: `Hi ${name}! Your jalfry forgot password code is: ${code}`,
					from: '+19175408423',
					to: `+1${n}`
				})
				.then((message) => {
					res.render('forgot_password', {
						code: true
					})
				})
			})
		} else {
			res.render('forgot_password', {
				message: "Phone number does not match any accounts, please register"
			})
		}
	})
})

router.post('/forgot_password/code', (req, res) => {
	let code = req.body.code;
	let q = `SELECT * FROM forgot_password WHERE code = '${code}'`;
	db.query(q, (err, results) => {
		if (err) throw err;

		if (results.length > 0) {
			res.redirect(`/reset_password/${code}`);
		} else {
			res.render('forgot_password', {
				code: false,
				message: 'Code is wrong. Please try again.'
			})
		}
	})
})

router.get('/reset_password/:code', (req, res) => {
	res.render('reset_password', {
		code: req.params.code
	})
})

router.post('/reset_password', (req, res) => {
	let code = req.body.code;
	let new_password = req.body.password;
	let q = `SELECT * FROM forgot_password WHERE code = '${code}'`;
	db.query(q, (err, results) => {
		if (err) throw err;

		if (results.length > 0) {
			let number = results[0].phone_number;
			let q = `UPDATE users SET password = '${new_password}' WHERE phone_number = '${number}'`;
			db.query(q, (err, results) => {
				if (err) throw err;

				res.redirect('/sso');
			})
		} else {
			res.redirect('/forgot_password');
		}
	})
})

router.options('/login/authorize', cors());
router.post("/login/authorize", cors(corsOptions), auth.token, (req, res) => {
	res.send({ status: 'no access' });
})

router.get("/login", (req, res) => {
	res.render(views_route + 'admin_login.hbs');
})

router.post("/admin", login.admin, (req, res) => {
	res.redirect("/administrator");
})

router.post("/admin_reg", reg.register, (req, res) => {
	res.redirect("/login");
})

router.get("/logout", (req, res) => {
	res.clearCookie('auth', { sameSite: 'None', secure: true, domain: 'jalfry.com' });
	res.send({ success: 'user logged out from jalfry!' });
	res.end();
})

router.get("/cross", (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.send({ success: 'good job!' });
})

router.get("/authenticate/request", (req, res) => {
	res.send(req.body);
})

module.exports = router;
