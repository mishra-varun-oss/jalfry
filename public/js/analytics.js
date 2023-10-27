const ws = new WebSocket("wss://jalfry.com/analytics/ws");

const t = document.querySelector("#t");

ws.addEventListener('open', (e) => {
	console.log('connected');
})

ws.addEventListener('message', (e) => {
//	console.log('message from server: ', e.data);
	var d = e.data.split('!!');

	if (d.length > 1) {
		for (var i = 0; i < d.length; i++) {
			var o = JSON.parse(d[i]);

			var row = t.insertRow(1);

			var domain = row.insertCell(0);
			var domain_text = document.createTextNode(o.domain);
			domain.appendChild(domain_text);

			var ip_address = row.insertCell(1);
			var ip_address_text = document.createTextNode(o.ip_address);
			ip_address.appendChild(ip_address_text);

			var time = row.insertCell(2);
			var time_text = document.createTextNode(o.time);
			time.appendChild(time_text);

			var request = row.insertCell(3);
			var request_text = document.createTextNode(o.request);
			request.appendChild(request_text);

			var bytes = row.insertCell(4);
			var bytes_text = document.createTextNode(o.body_bytes_sent);
			bytes.appendChild(bytes_text);

			var http_referer = row.insertCell(5);
			var http_referer_text = document.createTextNode(o.http_referer);
			http_referer.appendChild(http_referer_text);

			var ua = row.insertCell(6);
			var ua_text = document.createTextNode(o.user_agent);
			ua.appendChild(ua_text);

			var req_s = row.insertCell(7);
			var req_s_text = document.createTextNode(o.request_status);
			req_s.appendChild(req_s_text);

			var req_t = row.insertCell(8);
			var req_t_text = document.createTextNode(o.request_time);
			req_t.appendChild(req_t_text);

			var uc = row.insertCell(9);
			var uc_text = document.createTextNode(o.upstream_connect_time);
			uc.appendChild(uc_text);

			var uh = row.insertCell(10);
			var uh_text = document.createTextNode(o.upstream_header_time);
			uh.appendChild(uh_text);
		}
	}
})

function request_new_data() {
	console.log("sending data request...");
	setTimeout(request_new_data, 5000);
	
	var first_row = t.rows[1];
	var first_date = first_row.cells[2].textContent;

	var obj = {
		status: true,
		message: 'new analytics?',
		date: first_date
	}

	ws.send(JSON.stringify(obj));
}

request_new_data();
