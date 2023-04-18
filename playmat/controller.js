const DB = require ('./db_sqlite3');

exports.getAllPlaymats = function(req,res) {
	var db = new DB() ;
	db.queryPlaymatList((obj) => { res.end(JSON.stringify(obj)); });
};

exports.createPlaymat = function(req,res) {
	var db = new DB() ;
	db.createPlaymat(req.body.playmat, req.body.password, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.updatePlaymat = function(req,res) {
	res.send('');
};

exports.removePlaymat = function(req,res) {
	res.send('');
};

exports.checkPassword = function(req,res) {
	var db = new DB();
	db.checkPassword(req.body.playmat, req.body.password, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.getUpdates = function(req,res) {
	res.send('');
};

exports.upload = function(req,res) {
	let fs = require('fs');
	let formidable = require('formidable');

	let form = new formidable.IncomingForm();
	form.parse(req, function (error, fields, file) {
		var filepath = file.file.filepath;
		var original = file.file.originalFilename ;
		var extension = original.substr(original.lastIndexOf('.'));
		var newpath = 'assets/' + fields.fileName + extension ;
		
		var db = new DB();
		db.register(fields.playmat, fields.fileName, fields.fileName + extension, fields.type, fields.x, fields.y, (obj => { 
			if (obj.sucess == false ) {
				fs.unlink(filepath, function() {
					res.end(JSON.stringify(obj)); 
				});
			} else {
				fs.rename(filepath, newpath, function () {
					res.end(JSON.stringify(obj)); 
				});
			}
		}));
	});
};

exports.importFromWeb = function(req,res) {
	var db = new DB();
	db.register(req.body.playmat, req.body.fileName, req.body.url, req.body.type, req.body.x, req.body.y, (obj) => { 
		res.end(JSON.stringify(obj)); 
	});
}

exports.updateObject = function(req,res) {
	let fs = require('fs');
	var db = new DB();
	if (req.body.local == false) {
		db.updateObject(req.body.oldAlias, req.body.newAlias, req.body.type, (obj) => { 
			res.end(JSON.stringify(obj)); 
		});
	} else {
		fs.rename('assets/'+req.body.oldFile, 'assets/'+req.body.newFile, () => {
			db.updateObject(req.body.oldAlias, req.body.newAlias, req.body.newFile, req.body.type, (obj) => { 
				res.end(JSON.stringify(obj)); 
			});
		});
	}
};

exports.deleteObject = function(req,res) {
	let fs = require('fs');
	var db = new DB();
	if (req.body.local == false) {
		db.deleteObject(req.body.alias, req.body.type, (obj) => { 
			res.end(JSON.stringify(obj)); 
		});
	} else {
		fs.unlink('assets/'+req.body.file, () => {
			db.deleteObject(req.body.alias, req.body.type, (obj) => { 
				res.end(JSON.stringify(obj)); 
			});
		});
	}
};

exports.reuseObject =  function(req,res) {
	var db = new DB();
	db.reuseObject(req.body.playmat, req.body.alias, req.body.x, req.body.y, (obj) => { 
		res.end(JSON.stringify(obj)); 
	});
}

exports.updateToken = function(req,res) {
	var db = new DB();
	db.updateToken(req.body.playmat, req.body.id, req.body.scale, req.body.opacity, req.body.rotate, req.body.mirror, req.body.x, req.body.y, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.deleteToken = function(req,res) {
	var db = new DB();
	db.deleteToken(req.body.playmat, req.body.id, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.getObjects = function(req, res) {
	var db = new DB();
	db.getObjects(req.body.type, (obj) => { res.end(JSON.stringify(obj)) });
}

exports.table = function(req,res) {
	let fs = require('fs');
	var sanitize = (text) => {
		return text.replace(/"/g, '&quot;');
	};
	var input = (name, value) => {
		return '<input id="'+name+'" type="hidden" value="'+value+'"/>';
	};
	var db = new DB();
	db.joinPlaymat(req.body.playmatName, req.body.playmatPass, req.body.playerName, (obj) => {
		fs.readFile('./static/table.html', 'utf8', (err, data) => {
			if (err) {
				res.send(err);
			} else {
				var initialData = '\n\t\t'+ input('playmatName',sanitize(req.body.playmatName))+
				                  '\n\t\t'+ input('playmatPass',sanitize(req.body.playmatPass))+
				                  '\n\t\t'+ input('initialData',sanitize(JSON.stringify(obj.objects)));
				data = data.replace(input('playmatId','-1'),input('playmatId',obj.id)+initialData);
				res.end(data);
			}
		});
	});
}