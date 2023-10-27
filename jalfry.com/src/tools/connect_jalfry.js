const mysql = require('mysql');

const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'chef2',
	password:'novtown',
	database:'jalfry'
});

connection.connect((err)=>{
	if(err) throw err;
	console.log('Connected to JALFRY');
});

module.exports = connection;
