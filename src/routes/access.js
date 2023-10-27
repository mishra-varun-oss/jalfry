const path = require("path");
const express = require("express");

const router = express.Router();

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const sess = require(path.join(__dirname, "../middleware/session_check.js"));
const login = require(path.join(__dirname, "../middleware/login.js"));

router.post("/login", login.access, (req, res) => {
	res.redirect("/access");
})

router.post("/pass", login.access_pass, (req, res) => {
	res.send({ success: 'https://jalfry.com/access' });
})

router.get("/logout", (req, res) => {
	req.session.destroy();

	res.clearCookie('auth', { sameSite: 'None', secure: true, domain: 'jalfry.com' });

	res.redirect("/");
})

router.use(sess.access_check);

router.get("/", (req, res) => {
	var q = `SELECT * FROM users WHERE username = '${req.session.username}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			let r =  results[0];
			let list = [];
			let q = `SELECT * FROM domains`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;
				
				results.forEach((result) => {
					let d = result.domain;
					if (r[d]) {
						let obj = {
							domain: d,
							url: result.login_url
						}
						list.push(obj);
					}
				})				
				res.render("access_apps", {
					username: req.session.username,
					permission: list
				})
			})
		} else {
			res.redirect('/');
		}
	})
})

module.exports = router;
