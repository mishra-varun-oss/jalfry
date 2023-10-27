const s = document.getElementById("s");
const individual_setting = document.getElementById("ind");
const group_setting = document.getElementById("group");
const b = document.getElementById("b");

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

group_setting.style.display = "none";
b.disabled = true;

s.addEventListener("change", (e) => {
	e.preventDefault();

	if (s.value == "individual") {
		individual_setting.style.display = "block";
		group_setting.style.display = "none";
	} else if (s.value = "group") {
		individual_setting.style.display = "none";
		group_setting.style.display = "block";
	}
})		

function resetButton() {
	b.disabled = false;
}

let tb = document.querySelector("#tb");
let domains = document.querySelector("#domains").value.split(',');

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

fetch("https://jalfry.com/administrator/get_group_permission_data")
.then(response => response.json())
.then((data) => {
	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			let row = document.createElement("tr");

			let choice = document.createElement("td");
			let radio = document.createElement("input");
			radio.type = "radio";
			radio.name = "group";
			radio.id = "rad";
			radio.value = data[i].group_name;
			radio.addEventListener('change', resetButton);
			choice.appendChild(radio);
			row.appendChild(choice);

			let group_name = document.createElement("td");
			let group_name_text = document.createTextNode(data[i].group_name);
			group_name.appendChild(group_name_text);
			row.appendChild(group_name);

			for (let j = 0; j < domains.length; j++) {
				let permission = document.createElement("td");
				if (!data[i][domains[j]]) {
					permission.innerHTML = `<strong>NONE</strong>`;
					permission.style.color = "red";
				} else {
					let p_text = document.createTextNode(data[i][domains[j]]);
					permission.appendChild(p_text);
				}
				row.appendChild(permission);
			}

			tb.appendChild(row);
		}
	}
})
