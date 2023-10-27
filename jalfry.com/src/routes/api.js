const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const router = express.Router();

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));

let cors_options = {
	origin: function (origin, callback) {
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
				console.log(h);
				callback(null, { origin: true });
			} else if (origin.includes("https://files.mpengs.com")) {
				callback(null, { origin: true });
			} else if (origin.includes("cozytables")) {
				console.log('cozy!!!');
				callback(null, { origin: true });
			} else if (origin.includes("strategy.mpengs")) {
				callback(null, { origin: true });
			} else {
				console.log('no', h);
				callback(null, { origin: false });
			}
		})
	}
}

router.options('/*', cors());
router.get('/get_users', cors(cors_options), (req, res) => {
	let domain = req.query.domain;

	let q = `SELECT * FROM users WHERE ${domain} = 'Admin' OR ${domain} = 'User'`;
	let list = [];
	db.query(q, (err, results) => {
		if (err) throw err;

		results.forEach((result) => {
			list.push(result.username);
		})
		res.send({ success: true, data: list })
	})
})

router.get("/get_roles", cors(cors_options), (req, res) => {
	let d = req.query.domain;
	let q = `SELECT * FROM roles WHERE domain = '${d}'`;
	let r = [];
	db.query(q, (err, results) => {
		if (err) throw err;
		results.forEach((result) => {
			let obj = {
				id: result.id,
				role: result.role,
				description: result.description
			}
			r.push(obj);
		})
		res.send({ success: true, result: r })
	})
})

router.post("/create_role", cors(cors_options), (req, res) => {
	let d = req.body.domain;
	let r = req.body.name;
	let description = req.body.description;
	let q = `INSERT INTO roles VALUES (default, '${d}', '${r}', '${description}')`;
	db.query(q, (err, results) => {
		if (err) throw err;

		res.send({ success: true });
	})
})

router.post('/delete_role', cors(cors_options), (req, res) => {
	let id = req.body.id;
	let q = `DELETE FROM roles WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;

		res.send({ success: true });
	})
})

module.exports = router;
