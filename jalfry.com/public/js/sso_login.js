const user = document.getElementById("username");
const pass = document.getElementById("password");
const login_form = document.getElementById("login_form");
//const code_form = document.getElementById("code_form");
const check = document.getElementById("enable_cookie");
const button = document.getElementById("button");
const m = document.getElementById("message");
//const pno = document.getElementById("phone");
//const code = document.getElementById("code");
//const tryagain = document.getElementById("tryagain");
const app_name = document.getElementById("app_name");

var o;
let uid;

//code_form.style.display = "none";
button.style.display = "none";
//tryagain.style.display = "none";

window.opener.postMessage({ ready: true }, '*');

async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

function reload() {
	window.location.reload();
}

check.addEventListener("change", (e) => {
	e.preventDefault();
	console.log('hello');
	
	if (check.checked) {
		button.style.display = "block";
		button.type = "submit";
	} else {
		button.style.display = "none";
		button.type = "button";
	}
})

login_form.addEventListener("submit", (e) => {
	e.preventDefault();
	
	postData("https://jalfry.com/login", { user: user.value.toLowerCase(), pass: pass.value.toLowerCase(), ref: o }) 
	.then((data) => {
		if (data.status) {
			var obj = { 
				token: data.token, 
				username: data.username 
			};
			console.log(obj);
			
			window.opener.postMessage(obj, o.current_link);	

			window.close();
		} else {
			message.textContent = data.message;
			//tryagain.style.display = "block";
		}
	})
})
/*
code_form.addEventListener("submit", (e) => {
	e.preventDefault();

	postData("https://jalfry.com/login", { code: code.value, ref: o, uid: uid, phone: pno.value })
	.then((data) => {
		if (data.status) {
			var obj = { 
				token: data.token, 
				username: data.username 
			};
			console.log(obj);
			
			window.opener.postMessage(obj, o.current_link);	

			window.close();
		} else {
			message.textContent = data.message;
			tryagain.style.display = "block";
		}
	})
})
*/
window.addEventListener("message", (e) => {
	o = e.data
	console.log(o);

	let parent_domain = o.login_link.split('https://wrbl.')[1];
	app_name.textContent = parent_domain;
	document.title = parent_domain;
	document.getElementById('register_link').href = `/register?app=${o.domain}`;
//	document.querySelector("#register").href = `/register?app=${o.domain}`;
	
	if (o.current_link.includes("?logout=true")) {
		fetch("https://jalfry.com/logout") 
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
		})
	} else if (document.cookie) {
		var _cookie = decodeURIComponent(document.cookie);
		var cookie = _cookie.split('=j:')[1];

		var c = JSON.parse(cookie);
		
		if (c.login_status) {
			message.textContent = 'Please wait... logging you in';

			postData("https://jalfry.com/login/pass", { user: c.username, ref: o })
			.then((data) => {
				console.log(data);
				if (data.status) {
					var obj = { 
						token: data.token, 
						username: c.username
					};
	
					window.opener.postMessage(obj, o.current_link);	

					window.close();
				} 
			})
		}
	}
})

window.onload = function() {
	if (window.opener) {
//		message.textContent = 'good to go';
	} else {
		window.location = 'https://jalfry.com';
	}
}
