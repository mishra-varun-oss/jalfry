window.onload = () => {
	let selects = document.getElementsByClassName("select_role");
	for (let i = 0; i < selects.length; i++) {
		let d = selects[i].id;
		post("https://jalfry.com/administrator/get_roles", { domain: d })
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
}

async function post(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'post', 
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	return response.json();
}
