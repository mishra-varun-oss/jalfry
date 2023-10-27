const b = document.getElementById("b");
const d = document.getElementById("d");
const l = document.getElementById("l");
const info = document.getElementById("info");
const view = document.getElementById("view");
const src = document.getElementById("src");
const js = document.getElementById("js");
const secret = document.getElementById("secret");
const s = document.querySelector("#approval");
const r = document.querySelector("#r");

info.style.display = "none";

async function postData (url = '', data = {}) {
	const response = await fetch(url, {
		method: 'post', 
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

function add_role_input() {
	let div = document.createElement("div");
	let title = document.createElement("input");
	let description = document.createElement("input");

	title.type = "text";
	title.classList.add("form-control");
	title.classList.add("col");
	title.placeholder = "role name";

	description.type = "text";
	description.classList.add("form-control");
	description.classList.add("col");
	description.placeholder = "description";

	div.classList.add("role_input");
	div.classList.add("row");
	div.appendChild(title);
	div.appendChild(description);

	r.appendChild(div);
}

b.addEventListener("click", (e) => {
	e.preventDefault();

	let role_inputs = document.getElementsByClassName("role_input");
	let roles = [];
	for (let i = 0; i < role_inputs.length; i++) {
		let rows = role_inputs[i];
		let children = rows.getElementsByTagName('*');
		for (let j = 0; j < children.length; j += 2) {
			let obj = {
				title: children[j].value,
				description: children[j + 1].value
			}
			roles.push(obj);
		}
	}
	postData("https://jalfry.com/administrator/add_login", { domain: d.value, login_url: l.value, approval: s.value, roles: roles })
	.then((data) => {
		if (data.status) {
			info.style.display = "block";

			view.textContent = data.view_code;
			src.textContent = data.app_code;
			js.textContent = data.js_code;
			secret.textContent = 'APP SECRET: ' + data.secret;
		}
	})
})
