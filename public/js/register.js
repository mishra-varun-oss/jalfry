let u = document.querySelector("#username");
let p = document.querySelector("#password");
let n = document.querySelector("#phone");
let r = document.querySelector("#role");
let form = document.querySelector("#registration_form");
let m = document.querySelector("#message");
let t = document.querySelector("#title");
let d = document.querySelector("#form_content");

let params = (new URL(document.location)).searchParams;
let app = params.get("app");
t.textContent = `Create account for ${app}`;

window.onload = () => {

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
	if (n.value.length == 10 && /^[0-9]+$/.test(n.value)) {
		postData("https://jalfry.com/register", { username: u.value, password: p.value, phone_number: n.value, role: r.value, domain: app })
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
	} else {
		m.textContent = 'Invalid phone number. Do not include any hyphens, spaces, paranthesis in your entry. Also be sure to only include digits from 0 to 9!';
	}
})
