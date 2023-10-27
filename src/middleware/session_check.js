module.exports.check = (req, res, next) => {
	if (req.session.loggedin) {
		next();
	} else {
		res.redirect("/login");
	}
}

module.exports.access_check = (req, res, next) => {
	if (req.session.loggedin) {
		next();
	} else {
		res.redirect("/");
	}
}
