let tb = document.querySelector("#tb");
let domains = document.querySelector("#domains").value.split(',');

fetch("https://jalfry.com/administrator/get_permission_data")
.then(response => response.json())
.then((data) => {
	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			let row = document.createElement("tr");

			let id = document.createElement("td");
			let id_text = document.createTextNode(data[i].id);
			id.appendChild(id_text);
			row.appendChild(id);

			let username = document.createElement("td");
			let username_text = document.createTextNode(data[i].username);
			username.appendChild(username_text);
			row.appendChild(username);

			let permission_group = document.createElement("td");
			let pg_text;
			if (!data[i].permission_group) {
				pg_text = document.createTextNode('');
			} else {
				pg_text = document.createTextNode(data[i].permission_group);
			}
			permission_group.appendChild(pg_text);
			row.appendChild(permission_group);

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

			let edit_cell = document.createElement("td");
			let edit = document.createElement("a");
			edit.href = `/administrator/edit_user/${data[i].id}`;
			let edit_text = document.createTextNode("edit");
			edit.appendChild(edit_text);
			edit_cell.appendChild(edit);
			row.appendChild(edit_cell);

			let form_cell = document.createElement("td");
			let form = document.createElement("form");
			form.action = '/administrator/delete_user';
			form.method = 'post';
			let input = document.createElement('input');
			input.type = 'hidden';
			input.value = data[i].username;
			input.name = 'id';
			let button = document.createElement('button');
			button.type = 'submit';
			let button_text = document.createTextNode("delete");
			button.appendChild(button_text);
			form.appendChild(input);
			form.appendChild(button);
			form_cell.appendChild(form);
			row.appendChild(form_cell);


			tb.appendChild(row);
		}	
	}
})
