const vs = document.getElementById("vs");
const s = document.getElementById("s");
const approval = document.querySelector("#approval");
const id = document.querySelector("#id");
const r = document.querySelector("#ar");
const domain = document.querySelector("#domain_name").value;
const t = document.querySelector("#roles");

for (var i = 0; i < approval.options.length; i++) {
	if (approval.options[i].value == r.value) {
		approval.options[i].selected = true;
	}
}

function create_table() {
	t.innerHTML = '';

	postData("https://jalfry.com/administrator/get_roles", { domain: domain })
	.then((data) => {
		if (data.success) {
			let t_head = document.createElement("tr");
			let title_header = document.createElement("th");
			let description_header = document.createElement("th");
			let delete_header = document.createElement("th");
			let th_text = document.createTextNode("role title");
			let dh_text = document.createTextNode("role description");
			title_header.appendChild(th_text);
			description_header.appendChild(dh_text);
			t_head.appendChild(title_header);
			t_head.appendChild(description_header);
			t_head.appendChild(delete_header);
			t.appendChild(t_head);

			if (data.result.length > 0) {
				for (let i = 0; i < data.result.length; i++) {
					let role = document.createElement("tr");

					let title = document.createElement("td");
					let title_input = document.createElement("input");
					title_input.classList.add("form-control");
					title_input.type = "text";
					title_input.value = data.result[i].role;
					title_input.id = `role_${data.result[i].id}`;
					title_input.addEventListener("change", () => { edit_role(data.result[i].id, 'role', data.result[i].role) });
					title.appendChild(title_input);

					let description = document.createElement("td");
					let description_input = document.createElement("input");
					description_input.classList.add("form-control");
					description_input.type = "text";
					description_input.value = data.result[i].description;
					description_input.id = `description_${data.result[i].id}`;
					description_input.addEventListener("change", () => { edit_role(data.result[i].id, 'description', '') });
					description.appendChild(description_input);

					let delete_td = document.createElement("td");
					let delete_button = document.createElement("a");
					let button_text = document.createTextNode("delete");
					delete_button.appendChild(button_text);
					delete_button.addEventListener("click", () => { delete_role(data.result[i].id) })
					delete_td.appendChild(delete_button);

					role.appendChild(title);
					role.appendChild(description);
					role.appendChild(delete_td);

					t.appendChild(role);
				}
			}		
		}
	})
}

function delete_role(id) {
	postData("https://jalfry.com/administrator/delete_role", { id: id })
	.then((data) => {
		if (data.success) {
			create_table();
		}
	})
}

function edit_role(id, type, past_value) {
	let value = document.querySelector(`#${type}_${id}`).value;
	postData("https://jalfry.com/administrator/edit_role", { id: id, type: type, value: value, past_value: past_value, domain: domain })
	.then((data) => {
		if (data.success) {
			create_table();
		}
	})
}

function add_role() {
	let role = document.createElement("tr");

	let title = document.createElement("td");
	let title_input = document.createElement("input");
	title_input.classList.add("form-control");
	title_input.type = "text";
	title_input.id = "add_role";
	title.appendChild(title_input);

	let description = document.createElement("td");
	let description_input = document.createElement("input");
	description_input.classList.add("form-control");
	description_input.type = "text";
	description_input.id = "add_description";
	description.appendChild(description_input);

	let submit_td = document.createElement("td");
	let submit_button = document.createElement("a");
	let button_text = document.createTextNode("submit");
	submit_button.appendChild(button_text);
	submit_button.type = "button";
	submit_button.addEventListener("click", () => { add_role_submit() });
	submit_td.appendChild(submit_button);

	role.appendChild(title);
	role.appendChild(description);
	role.appendChild(submit_td);

	t.appendChild(role);	
}

function add_role_submit() {
	let role = document.querySelector("#add_role").value;
	let description = document.querySelector("#add_description").value;
	postData("https://jalfry.com/administrator/add_role", { domain: domain, role: role, description: description })
	.then((data) => {
		if (data.success) {
			create_table();
		}
	})
}

window.onload = () => { create_table() };

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

vs.addEventListener("click", (e) => {
	e.preventDefault();

	if (s.type == "password") {
		s.type = "text";
		vs.textContent = "hide";
	} else if (s.type == "text") {
		s.type = "password";
		vs.textContent = "un hide";
	}
})

approval.addEventListener('change', (e) => {
	e.preventDefault();

	postData("https://jalfry.com/administrator/change_approval", { value: approval.value, id: id.value })
	.then((data) => {
		console.log(data);
	})
})
