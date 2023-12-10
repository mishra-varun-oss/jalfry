const form = document.querySelector("#login_form");

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
function base64ToArrayBuffer(base64) {
	var binaryString = atob(base64);
	var bytes = new Uint8Array(binaryString.length);
	for (var i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const username = document.querySelector("input").value;
	post('/webauthn/register', { username: username })
	.then((data) => {
		if (data.success) {
			//returning user
			post('/webauthn/returning_user', { username: username })
			.then(async (data) => {
				if (data.success) {
					const cred_request_options = {
						challenge: base64ToArrayBuffer(data.data.challenge),
						allowCredentials: [{ 
							//id: Uint8Array.from(
							//	data.data.credential_id, c => c.charCodeAt(0)),
							id: base64ToArrayBuffer(data.data.credential_id),
							type: 'public-key',
							transports: ['internal']
						}],
						timeout: 60000
					}
					const assertion = await navigator.credentials.get({ publicKey: cred_request_options });
					console.log(assertion);
				}
			})
		} else {
			//register new user
			post('/webauthn/new_user', { username: username })
			.then(async (data) => {
				if (data.success) {
					let registration_options = data.registration_options;
					registration_options.challenge = base64ToArrayBuffer(registration_options.challenge);
					registration_options.user.id = base64ToArrayBuffer(registration_options.user.id);
					let credential = await navigator.credentials.create({ publicKey: registration_options })

					//console.log(credential);
					//credential id from authentication
					//let credential_id = credential.id;

					//decode clientdata
					let utf8_decoder = new TextDecoder("utf-8");
					let client_data = utf8_decoder.decode(credential.response.clientDataJSON);
					const client_data_obj = JSON.parse(client_data);
					let client_challenge = client_data_obj.challenge;
					let client_host = client_data_obj.origin;
					let client_type = client_data_obj.type;

					//decode attestation
					const decoded_attestation = CBOR.decode(credential.response.attestationObject);
					let auth_data = decoded_attestation.authData;
					let auth_format = decoded_attestation.fmt;
					let attestation_stmt = decoded_attestation.attStmt;
					//console.log(decoded_attestation);
					
					//parse auth_data to get publicKey
					const data_view = new DataView(new ArrayBuffer(2));
					const id_len_bytes = auth_data.slice(53, 55);
					id_len_bytes.forEach((value, index) => data_view.setUint8(index, value));
					const credential_id_length = data_view.getUint16();
					
					const credential_id = auth_data.slice(55, 55 + credential_id_length);
					let credential_id_b64 = btoa(String.fromCharCode.apply(null, credential_id));
					//console.log(credential_id_b64);

					const public_key_bytes = auth_data.slice(55 + credential_id_length);
					const public_key_obj = CBOR.decode(public_key_bytes.buffer);

					let obj = {
						username: username,
						id: credential_id_b64,
						challenge: client_challenge,
						origin: client_host,
						type: client_type,
						public_key_bytes: public_key_bytes,
						auth_data: attestation_stmt,
						auth_format: auth_format
					}
					//console.log(obj);
					post('/webauthn/new_user/store', obj)
					.then((data) => {
						console.log(data);
					})
/*
					let uint8_attestation = new Uint8Array(credential.response.attestationObject);
					let obj = {
						username: username,
						id: credential.id,
						attestation_object: Array.from(uint8_attestation)
					}
					post('/webauthn/new_user/store', obj) 
					.then((data) => {
						console.log(data);
						let authdata = data.authData.data;
						console.log(authdata.toString('base64'));
					})
*/
				}
			})
		}
	})
})
