const path = require("path");
const express = require("express");

const router = express.Router();

//render the login page
router.get("/", (req, res) => {
	res.render("login");
})

//user has access to the app. Implement the session logic here and redirect the user to the actual application
router.post("/login", (req, res) => {
	//username and permission information from jalfry
	let u = req.body.username;
	let p = req.body.permission;

	//store user information in session
	req.session.username = u;
	req.session.role = p;
	req.session.loggedin = true;

	//redirect user to the application
	res.send({ url: `https://{your web app url}` });
})
