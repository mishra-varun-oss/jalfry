function display_options(e, element) {
	e.preventDefault();
	
	element.style.fontWeight = "900";

	element.children[3].children[0].hidden = false;
	element.children[4].children[0].hidden = false;
}

function hide_options(e, element) {
	e.preventDefault();

	element.style.fontWeight = "400";

	element.children[3].children[0].hidden = true;
	element.children[4].children[0].hidden = true;
}
