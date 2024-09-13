const https = require('https');
const request = require('request');

const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

class RandomService {

	getNumbers(callback) {
		var url = 'https://api.random.org/json-rpc/4/invoke' ;
		var payload = {
			"jsonrpc": "2.0",
			"method": "generateIntegers",
			"params": {
				"apiKey": "5bb4a08d-46f0-4da4-9d6a-de2b551fa752",
				"n": 150,
				"min": 1,
				"max": 1200,
				"replacement": true
			},
			"id": 42
		};
		request.post({
			url: url, 
			headers: {
				'Content-Type': 'application/json',
					'Accept': 'application/json'
			},
			agent: httpsAgent,
			body: JSON.stringify(payload),
		}, function (error, response, body) {
			var data = JSON.parse(body).result.random.data ;
			callback(data) ;
		});
	}
}

module.exports = RandomService ;