const path = require("path");
const express = require("express");

const router = express.Router();

const views_route = '/var/www/jalfry.com/templates/views/';

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const auth = require(path.join(__dirname, "../services/authenticate.js"));
const pin = require(path.join(__dirname, "../tools/pin_generator.js"));
const add_pin = require(path.join(__dirname, "../tools/add_pin.js"));
const token = require(path.join(__dirname, "../tools/gen_token.js"));

router.get("/", (req, res) => {
	res.render(views_route + 'login.hbs');
})

router.get("/welcome", (req, res) => {
	var q = `SELECT * FROM users`;

	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		res.render(views_route + "index.hbs", {
			user: rows
		})
	})
})

router.get("/user_permissions", (req, res) => {
	res.send(req.query);
})

router.post("/login", (req, res) => {
	var username = req.body.username;
	var password = req.body.password;

	if (username == 'jalfry') {
		if (password == '123') {
			var q = `SELECT * FROM users WHERE username = '${username}'`;

			db.query(q, (err, results, fields) => {
				if (err) throw err;
				
				var login_to = [];
				var obj = {
					login: 'success'
				}

				if ((results[0].mr_admin == 1) || (results[0].mr_user == 1)) {
					var mr_pin = pin.new_pin();

					var mr_obj = {
						domain: 'mountrook.com',
						uid: mr_pin
					}

					add_pin.add_pin(mr_pin, 'mountrook_pin', username);

					login_to.push(mr_obj);
				}

				if ((results[0].rc_admin == 1) || (results[0].rc_doctor == 1)) {
					var rc_pin = pin.new_pin();

					var rc_obj = {
						domain: 'health.relentlesscomputing.com',
						uid: rc_pin
					}
					
					add_pin.add_pin(rc_pin, 'relentless_pin', username);

					login_to.push(rc_obj);
				}

				if ((results[0].mp_admin == 1) || (results[0].mp_employee)) {
					var mp_pin = pin.new_pin();
					
					var mp_com_obj = {
						domain: 'mpengs.com',
						uid: mp_pin
					}

					var mp_obj = {
						domain: 'mpengs.nyc',
						uid: mp_pin
					}
					
					add_pin.add_pin(mp_pin, 'mpengs_pin', username);

					login_to.push(mp_obj);
					login_to.push(mp_com_obj);
				}

				obj.access = login_to;

				console.log(obj);

				res.send(obj);
			})
		}
	} else {
		var obj = {
			login: 'fail'
		}

		res.send(obj);
	}
})

router.post("/authenticate", auth.verify, auth.permissions, (req, res) => {
	console.log(req.body);

	res.send("recieved :)");
})

router.get('/cookie', (req, res) => {
	res.cookie('jalfry', 'testing', { maxAge: 900000 });
})

module.exports = router;
