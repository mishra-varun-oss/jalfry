const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cbor = require('cbor');

const router = express.Router();

const db = require(path.join(__dirname, "../tools/connect_jalfry.js"));
const uid = require(path.join(__dirname, "../tools/pin_generator.js"));

//substitute with DB query logic
const username = 'username';

router.get('/', (req, res) => {
	res.render('webauthn_login');
})

router.post('/register', (req, res) => {
	let u = req.body.username;
	let q = `SELECT * FROM webauthn	WHERE username = '${u}'`;
	db.query(q, (err, results) => {
		if (err) throw err;
		if (results.length > 0) {
			res.send({ success: true, username: u })
		} else {
			res.send({ success: false, username: u })
		}
	})
})

router.post('/new_user', (req, res) => {
	let u = req.body.username;
	let user_id = uid.new_pin();
	let challenge = uid.new_pin();
	let registration_options = {
		challenge: challenge,
		rp: { name: "Jalfry" },
		user: { name: u, id: user_id, displayName: u },
		pubKeyCredParams: [{type: "public-key", alg: -7 }],
		timeout: 60000,
		attestation: "none"
	}
	
	let q = `INSERT INTO webauthn VALUES (default, '${u}', '${user_id}', '', '', '${challenge}')`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.send({ success: true, registration_options: registration_options });
	})
})
	
router.post('/new_user/store', (req, res) => {
	const {
		username,
		challenge,
		origin,
		type,
		id, 
		public_key_bytes
	} = req.body;

	let q = `SELECT * FROM webauthn WHERE username = '${username}'`;
	db.query(q, (err, results) => {
		if (err) throw err;
		if (results[0].challenge == challenge) {
			if ((origin == 'https://jalfry.com' || origin == 'https://www.jalfry.com') && type == 'webauthn.create') {
				//registration event is verified! save public key and credential id
				let q = `UPDATE webauthn SET public_key = '${JSON.stringify(public_key_bytes)}', cred_id = '${id}' WHERE username = '${username}'`; db.query(q, (err, results) => {
					if (err) throw err;
					res.send({ success: true })
				})
			}
		} else {
			res.send({ success: false })
		}
	})
})

router.post('/returning_user', (req, res) => {
	let u = req.body.username;
	let q = `SELECT * FROM webauthn WHERE username = '${u}'`;
	let challenge = uid.new_pin();
	db.query(q, (err, results) => {
		if (err) throw err;
		let obj = {
			challenge: challenge,
			credential_id: results[0].cred_id
		}
		let q = `UPDATE webauthn SET challenge = '${challenge}' WHERE username = '${u}'`;
		db.query(q, (err, results) => {
			if (err) throw err;
			res.send({ success: true, data: obj });
		})
	})
})

router.post('/returning_user/validate', (req, res) => {
	//hash client data
	let client_data;
	let auth_data_bytes
	let client_hash = crypto.createHash('sha256');
	client_hash.update(client_data);
	let h1 = client_hash.digest('hex');

	let signed_data = (auth_data_bytes + h1);

	let public_key;
	let signature;
	let decrypted_data = crypto.publicDecrypt(public_key, signature);

	//compare decrypted with signed_data
})

module.exports = router;
