let sso;

//define hostname here. For example, h = 'example.com'
let h = '';

//define domain name here. Using the above example, d = 'example'
let d = '';

//define the URL to your login page. Using the above examples, login_url = 'https://example.com/login'. The 'https://' in the beginning is necessary!
let login_url = '';

//define the route to your login logic. This should be a post route handler on the backend where you handle logged in users. For example, login_logic_url = 'https://example.com/login'. The 'https://' in the beginning is necessary!
let login_logic_url = '';

async function post(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

async function postToken(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': JSON.stringify(data)
		},
		body: JSON.stringify(data)
	})

	return response.json();
}

function clickhandler(e) {
	e.preventDefault();

	let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=600,left=100,top=100`;
	sso = window.open("https://jalfry.com/sso", "login with jalfry", params);
}

window.addEventListener("message", (e) => {
	e.preventDefault();
	
	if (e.origin == "https://jalfry.com") {
		if (e.data.ready) {
			let obj = {
				domain: d,
				login_link: login_url,
				current_link: window.location.href
			}
			sso.postMessage(obj, 'https://jalfry.com/sso');
		} else {
			let ed = e.data;
			let token = ed.token;
			let username = ed.username;
			
			postToken('https://jalfry.com/login/authorize', { domain: d, token, secret: '', username })
			.then((data) => {
				if (data.status) {
					//user is logged in, implement app session logic here... username and permission is stored in data object
					post(login_logic_url, { username: data.username, permission: data.permission, token })
					.then((data) => {
						window.location = data.url;
					})
				} else {
					//user does not have access to this application... jalfry will tell the user this in the login pop up window
					console.log('no access :(');
				}
			})
		}
	}
})
