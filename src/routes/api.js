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


module.exports = router;
