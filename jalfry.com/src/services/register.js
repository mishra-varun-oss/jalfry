const express = require("express");

const db = require("/var/www/jalfry.com/src/tools/connect_jalfry.js");
const hash = require("/var/www/jalfry.com/src/tools/hash.js");

module.exports.register = async (req, res, next) => {
	const username = req.body.user.split(' ').join('');
	const password = await hash.hash_password(req.body.pass);

	const q = `INSERT INTO admins(username, password, approval_status) VALUES ('${username}', '${password}', 'NOT APPROVED')`;

	db.query(q, (err, results, fields) => {
		if (err) throw err;

//		console.log(`${username} has registered!`);
	})

	next();
/*
	res.render("waiting_page", {
		username: username,
		role: role
	});
*/
}
