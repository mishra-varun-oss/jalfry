const app = Vue.createApp({
	data() {
		return {
			hide: false
		}
	},
	methods: {
		show_button(event) {
			if (event.target.checked) {
				this.hide = true;
			} else {
				this.hide = false;
			}
		}
	}
});

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

/*
const p = document.getElementById("passwords");
const u = document.getElementById("usernames");
const uc = document.getElementById("username_cont");
const c = document.getElementById("allow");

uc.style.display = "none";


c.addEventListener("change", (e) => {
	e.preventDefault();

	if (c.checked) {
		uc.disabled = false;
		uc.style.display = "block";
	} else {
		uc.disabled = true;
		uc.style.display = "none";
	}
})

*/
