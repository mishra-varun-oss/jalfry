const path = require('path');
const fs = require('fs');

const mysql = require('mysql');

const db = require(path.join(__dirname, "./connect_jalfry.js"));
const configs = require(path.join(__dirname, "./configs.js"));

require("dotenv").config(configs.tools_config_obj);

module.exports.insert_data = (domains) => {
	return new Promise((resolve, reject) => {
		var c = 0;
		domains.forEach((d) => {
			c++;

			fs.readFile(path.join(process.env.NGINX_LOG_PATH, `${d}.access.log`), { encoding: 'utf-8' }, (err, data) => {
				if (err) {
					return reject(err);
				} else {
					var d_lines = data.split("\n");
					
					d_lines.forEach((d_line) => {
						var info = d_line.split(';;;');

						if (info.length > 1) {
							var date_time = info[2].replaceAll('[', '').replaceAll(']', '');

							var q = `INSERT INTO analytics VALUES (default, '${d}', '${info[0]}', '${date_time}', '${info[3]}', '${info[4]}', '${info[5]}', '${info[6]}', '${info[7]}', '${info[8].split('rt=')[1]}', '${info[9].split('uct=')[1]}', '${info[10].split('uht=')[1]}', '${info[11].split('urt=')[1]}')`;

							db.query(q, async (err, results, fields) => {
								if (err) {
									return reject(err) 
								} else {
									fs.writeFile(`/var/log/nginx/${d}.access.log`, '', () => {
									//	console.log(`${d} deleted`);	 
									})
								}
							})
						}
					})
				}
			})

			if (c == domains.length) {
				resolve({ status: true })
			}
		})
	})
}
