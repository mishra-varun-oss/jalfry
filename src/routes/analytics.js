const path = require('path');
const fs = require('fs');

const express = require('express');
const mysql = require('mysql');

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const log_tools = require(path.join(__dirname, "../tools/log_parsing.js"));

const router = express.Router();
var domains = ['mountrook', 'jalfry', 'kalyah', 'mpengs', 'hashfav', 'nestfeeds', 'relentless', 'mycivvi', 'pr0ce55-com', 'warble-me', 'sneakport'];

router.get('/', (req, res) => {


	log_tools.insert_data(domains)
	.then((obj) => {
		var q = `SELECT DISTINCT * FROM analytics ORDER BY id DESC LIMIT 100`;
		db.query(q, (err, rows, fields) => {
			if (err) throw err;

			res.render('analytics', {
				row: rows		
			});
		})
	})
})

router.post('/data', (req, res) => {
	if (req.body.date) {
		var q = `SELECT id FROM analytics WHERE time = '${req.body.date}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			var id = results[0].id;
			var list = [];
			
			log_parse.insert_data(domains)
			.then((obj) => {
				var q = `SELECT DISTINCT * FROM analytics WHERE id > ${id}`;
				db.query(q, (err, rows, fields) => {
					if (err) throw err;

					for (var i = 0; i < rows.length; i++) {
						var r = rows[i];

						var obj = {
							domain: r.domain,
							ip_address: r.ip_address,
							time: r.time,
							request: r.request,
							request_status: r.request_status,
							body_bytes_sent: r.body_bytes_sent,
							http_referer: r.http_referer,
							user_agent: r.user_agent,
							request_time: r.request_time,
							upstream_connect_time: r.upstream_connect_time,
							upstream_header_time: r.upstream_header_time
						}

						list.push(obj);
					}

					res.send({ data: list });
				})
			})
		})
	}
})


router.get('/log_configurations', (req, res) => {
	res.render('log_configurations');
})

module.exports = router;
