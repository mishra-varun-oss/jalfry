const check = document.getElementById("enable_cookie");
const button = document.getElementById("button");

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

window.onload = () => {
	if (document.cookie) {
		var _cookie = decodeURIComponent(document.cookie);
		var cookie = _cookie.split('=j:')[1];

		var cookie_val = JSON.parse(cookie);
		if (cookie_val.login_status) {
			postData('https://jalfry.com/access/pass', { username: cookie_val.username })
			.then((data) => {
				var url = data.success;

				window.location = url;
			})
		}
	}
}
