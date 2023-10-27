function clickhandler(e) {
	e.preventDefault();
	
	let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`;

	window.open('https://jalfry.com/testwindow', 'test', params);
}
