let tb = document.querySelector("#tb");
let domains = document.querySelector("#domains").value.split(',');

fetch("https://jalfry.com/administrator/get_group_permission_data")
.then(response => response.json())
.then((data) => {
	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			let row = document.createElement("tr");

			let id = document.createElement("td");
			let id_text = document.createTextNode(data[i].id);
			id.appendChild(id_text);
			row.appendChild(id);

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

			let edit_cell = document.createElement("td");
			let edit = document.createElement("a");
			edit.href = `/administrator/edit_group/${data[i].id}`;
			let edit_text = document.createTextNode("edit");
			edit.appendChild(edit_text);
			edit_cell.appendChild(edit);
			row.appendChild(edit_cell);

			let form_cell = document.createElement("td");
			let form = document.createElement("form");
			form.action = '/administrator/delete_group';
			form.method = 'post';
			let input1 = document.createElement('input');
			input1.type = 'hidden';
			input1.value = data[i].id;
			input1.name = 'id';
			let input2 = document.createElement('input');
			input2.type = 'hidden';
			input2.value = data[i].group_name;
			input2.name = 'name';
			let button = document.createElement('button');
			button.type = 'submit';
			let button_text = document.createTextNode("delete");
			button.appendChild(button_text);
			form.appendChild(input1);
			form.appendChild(input2);
			form.appendChild(button);
			form_cell.appendChild(form);
			row.appendChild(form_cell);

			tb.appendChild(row);
		}	
	}
})
