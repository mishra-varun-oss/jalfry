const path = require("path");

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));

module.exports.check = (req, res, next) => {
	var ref = req.headers.referer;

	console.log(req.cookies);
	if (ref !== undefined) {
		if (req.cookies.auth) {
			var auth = req.cookies.auth;

			console.log(auth.permissions);

			next();
		} else {
			next();
		}
	} else {
		next();
	}
/*
	if (ref !== undefined) {
		if (req.cookies.auth) {
			if (req.cookies.auth.login_status) {
				var q = `SELECT * FROM users WHERE username = '${req.cookies.auth.username}'`;

				db.query(q, (err, results, fields) => {
					if (err) throw err;

//					console.log(results);

					var _ref = ref + `?jalfry=ok&pin=`;
					if (ref.includes('mpengs')) {
						if (results[0].mp_admin == 1) {
//							res.redirect(`https://mpengs.nyc/administrator?jalfry=ok&pin=${results[0].mpengs_pin}`);
							next();
						} else if (results[0].mp_employee == 1) {
//							res.redirect(`https://mpengs.nyc/login?jalfry=ok&pin=${results[0].mpengs_pin}`);
							next();
						}
					} else if (ref.includes('mountrook')) {
//						res.redirect(ref + `login?jalfry=ok&pin=${results[0].mountrook_pin}`);
							next();
					} else if (ref.includes('relentlesscomputing')) {
//						res.redirect(ref + `login?jalfry=ok&pin=${results[0].relentless_pin}`);
							next();
					} else {
						next();
					}
				})
			} 
		} else {
			next();
		}
	} else {
		next();
	}
	*/
}
