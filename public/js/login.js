const user = document.getElementById("username");
const pass = document.getElementById("password");
const form = document.getElementById("login_form");
const check = document.getElementById("enable_cookie");
const button = document.getElementById("button");

var original_url;

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

check.addEventListener("change", (e) => {
	e.preventDefault();
	
	if (check.checked) {
		button.disabled = false;
	} else {
		button.disabled = true;
	}
})

form.addEventListener("submit", (e) => {
	e.preventDefault();

//	console.log('FROM JF: ' + original_url);

	postData("https://jalfry.com/login", { user: user.value, pass: pass.value, ref: original_url })
	.then((data) => {
		var token = { token: data.token };
		var url = data.success;
		
		window.parent.postMessage(token, original_url);
	})
})

window.addEventListener("message", (e) => {
	console.log('FROM JF: ' + e.data);
	original_url = e.data;

	if (original_url.includes('logout=true')) {
//		console.log('logout!!');

		fetch("https://jalfry.com/logout") 
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
		})
	} else if (document.cookie) {
		var _cookie = decodeURIComponent(document.cookie);
		var cookie = _cookie.split('=j:')[1];

		var cookie_val = JSON.parse(cookie);
		
//		console.log(cookie_val);

		for (var i = 0; i < cookie_val.permissions.length; i++) {
			if (e.data.includes(cookie_val.permissions[i].domain) && cookie_val.login_status) {
				var domain = e.data.split('jf')[0];

				postData("https://jalfry.com/login/pass", { user: cookie_val.username, ref: original_url })
				.then((data) => {
					var token = { token: data.token };
					var url = data.success;
					
					window.parent.postMessage(token, original_url);
				})
			}
		}
	}
})

window.onload = function() {
	if (window.top.location.href.includes('jalfry.com')) {
		window.top.location.href = 'https://jalfry.com';
	}
}
