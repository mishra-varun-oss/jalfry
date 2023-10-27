const view_pass = document.getElementById("view_pass");
const password = document.getElementById("exampleInputPassword1");
const username = document.getElementById("exampleInputEmail1");
const phone_number = document.getElementById("phone_number");
const id = document.getElementById("id");

function permissionOption(element, option) {
	for (i = 0; i < element.options.length; i++) {
		if (element.options[i].value == option) {
			element.options[i].selected = true;
		} else if (option == null) {
			element.options[2].selected = true;
		}
	}
}

async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

function permissionHandler(e, element) {
	e.preventDefault();

	var obj = {
		type: element.id,
		value: element.value,
		id: id.value,
	}
	
	postData('https://jalfry.com/administrator/edit_user', obj)
	.then((data) => {
		console.log(data);
	})
}

window.onload = function() {
	let selects = document.getElementsByClassName("select_role");
	for (let i = 0; i < selects.length; i++) {
		let d = selects[i].id;
		postData("https://jalfry.com/administrator/get_roles", { domain: d })
		.then((data) => {
			if (data.success) {
				let results = data.result;
				for (let j = 0; j < results.length; j++) {
					let option = document.createElement("option");
					let option_text = document.createTextNode(results[j].role);
					option.value = results[j].role;
					option.appendChild(option_text);
					document.querySelector(`#${d}`).appendChild(option);
				}
			}
		})
	}

	postData('https://jalfry.com/administrator/edit_user/permissions', { id: id.value })
	.then((data) => {
		let domains = Object.keys(data);

		for (let i = 0; i < domains.length; i++) {
			let e = document.querySelector(`#${domains[i]}`);
			
			for (let j = 0; j < e.options.length; j++) {
				if (e.options[j].value == data[domains[i]]) {
					e.options[j].selected = true;
				}
			}
		}
	})
}

username.addEventListener("change", (e) => {
	e.preventDefault();

	var obj = {
		type: 'username',
		value: username.value,
		id: id.value
	}

	postData('https://jalfry.com/administrator/edit_user', obj)
	.then((data) => {
		console.log(data);
	})
})


password.addEventListener("change", (e) => {
	e.preventDefault();

	var obj = {
		type: 'password',
		value: password.value,
		id: id.value
	}

	postData('https://jalfry.com/administrator/edit_user', obj)
	.then((data) => {
		console.log(data);
	})
})

phone_number.addEventListener("change", (e) => {
	e.preventDefault();

	let obj = {
		type: 'phone_number',
		value: phone_number.value,
		id: id.value
	}

	postData('https://jalfry.com/administrator/edit_user', obj)
	.then((data) => {
		console.log(data);
	})
})

view_pass.addEventListener("click", (e) => {
	e.preventDefault();

	if (password.type == "password") {
		password.type = "text";
		view_pass.textContent = "hide";
	} else if (password.type == "text") {
		password.type = "password";
		view_pass.textContent = "un hide";
	}
})
