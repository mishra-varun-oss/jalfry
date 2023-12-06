const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cp = require("cookie-parser");
const hbs = require("hbs");
const ws = require("ws");

const app = express();

const viewsDirPath = path.join(__dirname, "../templates/views");
const partialsDirPath = path.join(__dirname, "../templates/partials/");
const publicDirPath = path.join(__dirname, "../public");
const routesDirPath = path.join(__dirname, "/routes/");

const index = require(routesDirPath + "index.js");
const administrator = require(routesDirPath + "administrator.js");
const access = require(routesDirPath + "access.js");
const analytics = require(routesDirPath + "analytics.js");
const api = require(routesDirPath + "api.js");

const log_parse = require(path.join(__dirname, "/tools/log_parsing.js"));
const db = require(path.join(__dirname, "/tools/connect_jalfry.js"));
const session_config = require(path.join(__dirname, "/tools/session_config.js"));
const configs = require(path.join(__dirname, "/tools/configs.js"));

require("dotenv").config(configs.src_config_obj);

app.set("view engine", "hbs");
app.set("views", viewsDirPath);
hbs.registerPartials(partialsDirPath, function (err) {});

app.use(express.static(publicDirPath));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cp());
app.use(session(session_config.session_config))

app.use("/", index);
app.use("/administrator", administrator);
app.use("/access", access);
app.use("/analytics", analytics);
app.use("/api", api);

const server = http.createServer(app);

const wss = new ws.Server({ noServer: true, path: '/analytics/ws' });

server.on('upgrade', (request, socket, head, client) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit('connection', ws, request, client);
	});
});

wss.on("connection", (ws, request) => {
	console.log('connected');

	ws.send('welcome to jalfry analytics!');

	ws.on('message', (message) => {
		var str = message.toString();
		var m = JSON.parse(str);
		var domains = ['mountrook', 'jalfry', 'kalyah', 'mpengs', 'hashfav', 'nestfeeds', 'relentless', 'mycivvi', 'pr0ce55-com', 'warble-me', 'sneakport'];

		if (m.date) {
			var q = `SELECT id FROM analytics WHERE time = '${m.date}'`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;

				var id = results[0].id;
				var list = [];
				
				log_parse.insert_data(domains)
				.then((obj) => {
					var q = `SELECT DISTINCT * FROM analytics WHERE id > ${id}`;
					db.query(q, (err, rows, fields) => {
						if (err) throw err;

						for (var i = 0; i < rows.length; i++) {
							var r = rows[i];

							var obj = {
								domain: r.domain,
								ip_address: r.ip_address,
								time: r.time,
								request: r.request,
								request_status: r.request_status,
								body_bytes_sent: r.body_bytes_sent,
								http_referer: r.http_referer,
								user_agent: r.user_agent,
								request_time: r.request_time,
								upstream_connect_time: r.upstream_connect_time,
								upstream_header_time: r.upstream_header_time
							}

							list.push(JSON.stringify(obj));
						}

						ws.send(list.join("!!"));
					})
				})
			})
		}
	})
})

const port = process.env.PORT
server.listen(port, () => {
	console.log(`jalfry is up on port ${port}!`);
})
