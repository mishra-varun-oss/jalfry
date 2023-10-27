const path = require('path');
const mysql = require('mysql');

const db = require(path.join(__dirname, "./connect_jalfry.js"));

module.exports.get_domains = () => {
	return new Promise((resolve, reject) => {
		let q = `SELECT domain FROM domains`;
		let domains = [];
		db.query(q, (err, results, fields) => {
			if (err) {
				return reject(err);
			}

			results.forEach((result) => {
				domains.push(result.domain);
			})

			resolve(domains);
		})
	})
}
