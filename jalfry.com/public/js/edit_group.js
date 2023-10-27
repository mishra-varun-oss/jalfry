const id = document.getElementById("id");
const gn = document.getElementById("g_name");

var og_name = gn.value;

window.onload = () => {
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

	postData('https://jalfry.com/administrator/edit_group/permissions', { id: id.value })
	.then((data) => {
		console.log(data);
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
	
	postData('https://jalfry.com/administrator/edit_group', obj)
	.then((data) => {
		console.log(data);
	})
}

function permissionCheck(id, element, e) {
	e.preventDefault();

	var obj = {
		id: id
	}

	if (element.checked) {
		obj.value = og_name;

		postData('https://jalfry.com/administrator/change_group', obj)
		.then((data) => {
			console.log(data);
		})
	} else {
		obj.value = '';

		postData('https://jalfry.com/administrator/change_group', obj)
		.then((data) => {
			console.log(data);
		})
	}
}


gn.addEventListener("change", (e) => {
	e.preventDefault();
	
	var obj = {
		type: 'group_name',
		value: gn.value,
		id: id.value,
		original: og_name
	}
	
	postData('https://jalfry.com/administrator/edit_group', obj)
	.then((data) => {
		console.log(data);

		og_name = data.new_name;
	})
})
