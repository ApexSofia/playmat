exports.getAllPlaymats = function(req,res) {
	var obj = {"playmats":[{"name":"Foo"},{"name":"Bar"}]};
	res.send(JSON.stringify(obj));
};

exports.checkPassword = function(req,res) {
	res.send('');
};

exports.createPlaymat = function(req,res) {
	res.send('');
};

exports.joinPlaymat = function(req,res) {
	res.send('');
};

exports.loadObject = function(req,res) {
	res.send('');
};


exports.getUpdates = function(req,res) {
	res.send('');
};
