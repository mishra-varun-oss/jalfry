let u = document.querySelector("#username");
let p = document.querySelector("#password");
let n = document.querySelector("#phone");
let r = document.querySelector("#role");
let form = document.querySelector("#registration_form");
let m = document.querySelector("#message");
let d = document.querySelector("#form_content");
let app_name = document.querySelector("#app_name");

let params = (new URL(document.location)).searchParams;
let app = params.get("app");

window.onload = () => {
	postData('/get_domain_info', { app_name: app })
	.then((data) => {
		if (data.success) {
			let hostname = data.login_url.split('https://wrbl.')[1]; 
			app_name.textContent = hostname;
			document.title = hostname;
			
			data.roles.forEach((role) => {
				let option = document.createElement('option');
				option.value = role.role;
				option.textContent = role.role;
				r.appendChild(option);
			})
		}
	})

}

function close_window() {
	window.close();
}

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

form.addEventListener("submit", (e) => {
	e.preventDefault();
	/*if (n.value.length == 10 && /^[0-9]+$/.test(n.value)) {*/
	postData("https://jalfry.com/register", { username: u.value, password: p.value, role: r.value, domain: app })
	.then((data) => {
		if (data.approved) {
			d.style.display = 'none';
			m.textContent = `Account created successfully! This window will now close. Please login with jalfry to access ${app}.`;
			setTimeout(() => {
				window.close();
			}, "5000")
		} else {
			d.style.display = 'none';
			m.textContent = `Account created successfully! This window will now close. Please wait for ${app} to approve your access to the app. Try logging in after you are approved!`;
			setTimeout(() => {
				window.close();
			}, "5000")
		}
	})
	/*
	} else {
		m.textContent = 'Invalid phone number. Do not include any hyphens, spaces, paranthesis in your entry. Also be sure to only include digits from 0 to 9!';
	}
	*/
})
