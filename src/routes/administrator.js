const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const sess = require(path.join(__dirname, "../middleware/session_check.js"));
const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const rg = require(path.join(__dirname, "../tools/random_generator.js"));
const utils = require(path.join(__dirname, "../tools/utils.js"));

router.use(sess.check);

router.get("/", (req, res) => {
	let q = `SELECT * FROM users WHERE approved = 'false'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		
		utils.get_domains()
		.then((domains) => {
			res.render("permissions", {
				username: req.session.username,
				domain: domains,
				waiting: results.length
			})
		})
	})
})

router.get("/waiting", (req, res) => {
	let q = `SELECT * FROM users WHERE approved = 'false'`;
	let list = [];
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		
		utils.get_domains() 
		.then((domains) => {
			for (let i = 0; i < results.length; i++) {
				for (let j = 0; j < domains.length; j++) {
					if (results[i][domains[j]]) {
						let obj = {
							username: results[i].username,
							app: domains[j],
							role: results[i][domains[j]],
							id: results[i].id
						}

						list.push(obj);
					}
				}
			}
		})
		.then(() => {
			res.render('waiting', {
				user: list,
				username: req.session.username
			})
		})
	})
})

router.post("/approve_user", (req, res) => {
	let id = req.body.id;
	let username = req.body.name;
	let q = `UPDATE users SET approved = 'true' WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let q = `INSERT INTO pins (username) VALUES ('${username}')`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			res.redirect("/administrator/waiting");
		})
	})
})

router.get("/get_permission_data", (req, res) => {
	let q = `SELECT * FROM users WHERE approved = 'true'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.send(results);
	})
})

router.get("/add_user", (req, res) => {
	utils.get_domains()
	.then((d) => {
		res.render("add_user", {
			username: req.session.username,
			domain: d
		})
	})
})

router.post("/add_user", (req, res) => {
	let q = `INSERT INTO pins (username) VALUES ('${req.body.username}')`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (req.body.type == "individual") {
			let q = `INSERT INTO users (username, password, phone_number, approved, permission_group) VALUES ('${req.body.username}', '${req.body.password}', '${req.body.phone_number}', 'true', '')`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				utils.get_domains()
				.then((domains) => {
					for (let i = 0; i < domains.length; i++) {
						let q = `UPDATE users SET ${domains[i]} = '${req.body[domains[i]]}' WHERE username = '${req.body.username}'`;
						db.query(q, (err, results, fields) => {
							if (err) throw err;
						})
					}
					res.redirect("/administrator");
				})
			})
		} else if (req.body.type == "group") {
			let q = `INSERT INTO users(username, password, phone_number, approved, permission_group) VALUES ('${req.body.username}', '${req.body.password}', '${req.body.phone_number}', 'true', '${req.body.group}');`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				let q = `SELECT * FROM permission_group WHERE group_name = '${req.body.group}'`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;

					utils.get_domains() 
					.then((domains) => {
						domains.forEach((domain) => {
							let q = `UPDATE users SET ${domain} = '${results[0][domain]}' WHERE username = '${req.body.username}'`;
							db.query(q, (err, results, fields) => {
								if (err) throw err;
							})
						})
					})
					.then(() => {
						res.redirect("/administrator");
					})
				})
			})
		}
	})
})

router.post("/delete_user", (req, res) => {
	let id = req.body.id;
	let q = `DELETE FROM users WHERE username = '${id}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
	
		let q = `DELETE FROM pins WHERE username = '${id}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;
	
			res.redirect("/administrator");
		})
	})
})

router.post("/delete_unapproved_user", (req, res) => {
	let id = req.body.id;
	let q = `DELETE FROM users WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.redirect("/administrator/waiting");
	})
})

router.get("/edit_user/:id", (req, res) => {
	let user_id = req.params.id;
	let q = `SELECT * FROM users WHERE id = ${user_id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		
		utils.get_domains() 
		.then((domains) => {
			res.render("edit_user", {
				username: req.session.username,
				user: results,
				domain: domains
			})
		})
	})
})

router.post("/edit_user", (req, res) => {
	let id = req.body.id;
	let type = req.body.type;
	let value = req.body.value;	
	let q = `UPDATE users SET ${type} = '${value}' WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let q = `UPDATE users SET permission_group = '' WHERE id = ${id}`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			res.send({ status: 'success :)'});
		})
	})
})

router.post("/edit_user/permissions", (req, res) => {
	let id = req.body.id;
	let q = `SELECT * FROM users WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let obj = {};
		utils.get_domains()
		.then((domains) => {
			domains.forEach((d) => {
				obj[d] = results[0][d];
			})

			res.send(obj);
		})
	})
})

router.get("/logout", (req, res) => {
	req.session.destroy();

	res.redirect("/login");
})

router.get("/groups", (req, res) => {
	let q = `SELECT * FROM permission_group`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;
		
		utils.get_domains() 
		.then((domains) => {
			res.render("permission_group", {
				username: req.session.username,
				row: rows,
				domain: domains
			})
		})
	})
})

router.get("/get_group_permission_data", (req, res) => {
	let q = `SELECT * FROM permission_group`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		res.send(rows);
	})
})

router.get("/add_group", (req, res) => {
	var q = `SELECT username FROM users WHERE approved = 'true'`;

	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		utils.get_domains()
		.then((domains) => {
			res.render("add_group", {
				username: req.session.username,
				row: rows,
				domain: domains
			})
		})
	})
})

router.post("/add_group", (req, res) => {
	let q = `INSERT INTO permission_group(group_name) VALUES ('${req.body.group_name}')`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		utils.get_domains() 
		.then((domains) => {
			for (let i = 0; i < domains.length; i++) {
				let q = `UPDATE permission_group SET ${domains[i]} = '${req.body[domains[i]]}' WHERE group_name = '${req.body.group_name}'`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;
				})
			}
		})
		.then(() => {
			let r = Array.isArray(req.body.username);

			if (r) {
				for (let i = 0; i < req.body.username.length; i++) {
					let u = req.body.username[i];
					let q = `UPDATE users SET permission_group = '${req.body.group_name}' WHERE username = '${u}'`;
					db.query(q, (err, results, fields) => {
						if (err) throw err;
						utils.get_domains()
						.then((domains) => {
							for (let j = 0; j < domains.length; j++) {
								let q = `UPDATE users SET ${domains[j]} = '${req.body[domains[j]]}' WHERE username = '${u}'`;
								db.query(q, (err, results, fields) => {
									if (err) throw err;
								})
							}
						})
					})
				}
			} else {
				let u = req.body.username;
				let q = `UPDATE users SET permission_group = '${req.body.group_name}' WHERE username = '${u}'`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;
					utils.get_domains()
					.then((domains) => {
						for (let j = 0; j < domains.length; j++) {
							let q = `UPDATE users SET ${domains[j]} = '${req.body[domains[j]]}' WHERE username = '${u}'`;
							db.query(q, (err, results, fields) => {
								if (err) throw err;
							})
						}
					})
				})
			
			}
		})
		.then(() => {
			res.redirect("/administrator/groups");
		})
	})
})

router.get("/edit_group/:id", (req, res) => {
	var id = req.params.id;

	var q = `SELECT * FROM permission_group WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		var q = `SELECT * FROM users WHERE permission_group = '${results[0].group_name}' OR permission_group = '' OR permission_group IS NULL AND approved = 'true'`;
		db.query(q, (err, rows, fields) => {
			if (err) throw err;

			utils.get_domains() 
			.then((domains) => {
				res.render("edit_group", {
					username: req.session.username,
					group: results,
					member: rows,
					domain: domains
				})
			})
		})
	})
})

router.post("/edit_group/permissions", (req, res) => {
	let id = req.body.id;

	let q = `SELECT * FROM permission_group WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		var obj = {};
		utils.get_domains()
		.then((domains) => {
			domains.forEach((d) => {
				obj[d] = results[0][d];
			})
		})
		.then(() => {
			console.log(obj);
			res.send(obj);
		})
	})
})

router.post("/edit_group", (req, res) => {
	let id = req.body.id;
	let type = req.body.type;
	let value = req.body.value;
	
	let q = `UPDATE permission_group SET ${type} = '${value}' WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (type == 'group_name') {
			let q = `UPDATE users SET permission_group = '${value}' WHERE permission_group = '${req.body.original}'`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;
				
				res.send({ status: 'success :)', new_name: value });
			})
		} else {
			let q = `SELECT group_name FROM permission_group WHERE id = ${id}`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				let group_name = results[0].group_name;
				let q = `SELECT username FROM users WHERE permission_group = '${group_name}'`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;

					for (let i = 0; i < results.length; i++) {
						let u = results[i].username;

						let q = `UPDATE users SET ${type} = '${value}' WHERE username = '${u}'`;
						db.query(q, (err, results, fields) => {
							if (err) throw err;
						})
					}

					res.send({ status: 'success :)'});
				})
			})
		}
	})
})

router.post("/change_group", (req, res) => {
	let id = req.body.id;
	let val = req.body.value; 
	let q = `UPDATE users SET permission_group = '${val}' WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let q = `SELECT * FROM permission_group WHERE group_name = '${val}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			utils.get_domains() 
			.then((domains) => {
				domains.forEach((domain) => {
					let q = `UPDATE users SET ${domain} = '${results[0][domain]}' WHERE id = '${id}'`;
					db.query(q, (err, results, fields) => {
						if (err) throw err;
					})
				})
			})
			.then(() => {
				res.send({ status: 'success :)' });
			})
		})
	})
})

router.post("/delete_group", (req, res) => {
	var q = `DELETE FROM permission_group WHERE id = ${req.body.id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		var q = `UPDATE users SET permission_group = '' WHERE permission_group = '${req.body.name}'`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			res.redirect("/administrator/groups");
		})
	})
})

router.get("/domains", (req, res) => {
	let q = `SELECT * FROM domains`;
	db.query(q, (err, rows, fields) => {
		if (err) throw err;

		res.render("domains", {
			username: req.session.username,
			r: rows
		})
	})
})

router.get("/domains/:id", (req, res) => {
	let id = req.params.id;
	let q = `SELECT * FROM domains WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
	
		res.render("domain_details", {
			username: req.session.username,
			id: results[0].id,
			domain: results[0].domain,
			secret: results[0].secret,
			url: results[0].login_url,
			approval: results[0].approval_required
		})
	})
})

router.post("/domains", (req, res) => {
	let id = req.body.id;
	let u = req.body.login_url;
	let q = `UPDATE domains SET login_url = '${u}' WHERE id = ${id}`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.redirect(`/administrator/domains/${id}`);
	})
})

router.post("/change_approval", (req, res) => {
	let value = req.body.value;
	let id = req.body.id;
	let q = `UPDATE domains SET approval_required = '${value}' WHERE id = '${id}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.send({ status: 'success :)' });
	})
})

router.get("/add_login", (req, res) => {
	res.render("add_login", {
		username: req.session.username
	})
})

router.post("/add_login", (req, res) => {
	rg.generator(15, (result) => {
		let s = result;
		let d;
		let domains = req.body.domain.split(".");
		if (domains.length > 2) {
			d = domains.slice(0, 2).join('');
		} else {
			d = domains[0];
		}
		let roles = req.body.roles;
		roles.forEach((role) => {
			let q = `INSERT INTO roles VALUES (default, '${d}', '${role.title}', '${role.description}')`;
			db.query(q, (err, results) => {
				if (err) throw err;
			})
		})
		let q = `INSERT INTO domains VALUES (default, '${d}', '${s}', '${req.body.login_url}', '${req.body.approval}')`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;
			
			let q_users = `ALTER TABLE users ADD COLUMN ${d} VARCHAR(50)`;
			db.query(q_users, (err, results, fields) => {
				if (err) throw err;

				let q_groups = `ALTER TABLE permission_group ADD COLUMN ${d} VARCHAR(50)`;
				db.query(q_groups, (err, results, fields) => {
					if (err) throw err;

					let q_pins = `ALTER TABLE pins ADD COLUMN ${d} VARCHAR(50)`;
					db.query(q_pins, (err, results, fields) => {
						if (err) throw err;
						
						fs.readFile(path.join(__dirname, "../../login_template/src/login.js"), 'utf8', (err, src_data) => {
							if (err) throw err;

							let app_code = src_data;
							fs.readFile(path.join(__dirname, "../../login_template/public/js/jf.js"), 'utf8', (err, js_data) => {
								if (err) throw err;

								let js_code = js_data;
								fs.readFile(path.join(__dirname, "../../login_template/templates/views/login.hbs"), 'utf8', (err, view_data) => {
									if (err) throw err;

									
									let view_code = view_data;
									res.send({ 
										status: true,
										secret: s,
										domain: req.body.domain,
										app_code,
										js_code,
										view_code
									})
								})
							})
						})
					})
				})
			})
		})
	})
})

router.post("/domains/delete", (req, res) => {
	let d = req.body.domain;
	let q = `DELETE FROM domains WHERE domain = '${d}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let q = `ALTER TABLE users DROP COLUMN ${d}`;
		db.query(q, (err, results, fields) => {
			if (err) throw err;

			let q = `ALTER TABLE permission_group DROP COLUMN ${d}`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				let q = `ALTER TABLE pins DROP COLUMN ${d}`;
				db.query(q, (err, results, fields) => {
					if (err) throw err;

					let q = `DELETE FROM roles WHERE domain = '${d}'`;
					db.query(q, (err, results) => {
						if (err) throw err;

						res.redirect("/administrator/domains");
					})
				})
			})
		})
	})
})

router.post("/get_roles", (req, res) => {
	let d = req.body.domain;
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

router.post("/delete_role", (req, res) => {
	let id = req.body.id;
	let q = `DELETE FROM roles WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;

		res.send({ success: true });
	})
})

router.post("/edit_role", (req, res) => {
	let id = req.body.id;
	let type = req.body.type;
	let value = req.body.value;
	let domain = req.body.domain;
	let past_value = req.body.past_value;
	let q = `UPDATE roles SET ${type} = '${value}' WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;

		if (type == 'role') {
			let q = `UPDATE permission_group SET ${domain} = '${value}' WHERE ${domain} = '${past_value}'`;
			db.query(q, (err, results) => {
				if (err) throw err;

				let q = `UPDATE users SET ${domain} = '${value}' WHERE ${domain} = '${past_value}'`;
				db.query(q, (err, results) => {
					if (err) throw err;

					res.send({ success: true });
				})
			})
		}
	})
})

router.post("/add_role", (req, res) => {
	let d = req.body.domain;
	let r = req.body.role;
	let description = req.body.description;
	let q = `INSERT INTO roles VALUES (default, '${d}', '${r}', '${description}')`;
	db.query(q, (err, results) => {
		if (err) throw err;

		res.send({ success: true });
	})
})

module.exports = router;
