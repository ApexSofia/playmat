const ws = require('ws');
const config = require('./config');

class BroadcastSocket {
	
	constructor () {
		this.wss = new ws.WebSocketServer({ port: config.socket.port });
		//const wss = new ws.WebSocketServer({ server: app, path: '/update' });}
		this.wss.on('connection', function connection(ws) {
			ws.on('error', console.error);
			ws.on('close', function () {
				console.log('Socket close\n');
			});
			ws.on('message', function message(data, isBynary) {
				console.log('Socket message');
				var obj = JSON.parse(data.toString());
				if (obj.action == 'register') {
					ws.playmat = obj.playmatId ;
					ws.name    = obj.playerName ;
					console.log('Socket registration');
				}
				console.log();
			});
			
			console.log('Socket connection\n');
		});
	}
	
	cast (id, data) {
		this.wss.clients.forEach(function each(client) {
			if (client.readyState === ws.WebSocket.OPEN && client.playmat == id) {
				client.send(data, { binary: false });
			}
		});
	}
}

module.exports = BroadcastSocket ;