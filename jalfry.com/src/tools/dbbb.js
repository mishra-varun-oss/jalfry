const mysql = require('mysql');

const connection = mysql.createConnection({
	host:'192.168.152.3',
	user:'memento',
	password:'L7sQMN,4z]',
	database:'sys_info'
});

connection.connect((err)=>{
	if(err) throw err;
	console.log('Connected ');
});
