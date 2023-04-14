const DB = require ('./db_sqlite3');

exports.getAllPlaymats = function(req,res) {
	var db = new DB() ;
	db.queryPlaymatList((obj) => { res.end(JSON.stringify(obj)); });
};

exports.createPlaymat = function(req,res) {
	var db = new DB() ;
	db.createPlaymat(req.body.playmat, req.body.password, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.checkPassword = function(req,res) {
	var db = new DB();
	db.checkPassword(req.body.playmat, req.body.password, (obj) => { res.end(JSON.stringify(obj)) });
};

exports.joinPlaymat = function(req,res) {
	// * La mesa no existe
	// * Contraseña de la mesa equivocada
	res.send('');
};

exports.loadObject = function(req,res) {
	res.send('');
};


exports.getUpdates = function(req,res) {
	res.send('');
};

exports.removePlaymat = function(req,res) {
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
		db.upload(fields.playmat, fields.fileName + extension, fields.type, (obj => { 
			fs.rename(filepath, newpath, function () {
				res.end(JSON.stringify(obj)); 
			});
		}));
	});
};

exports.table = function(req,res) {
	var input = (name, value) => {
		return '<input id="'+name+'" type="hidden" value="'+value+'"/>';
	}
	let fs = require('fs');
	var db = new DB();
	db.joinPlaymat(req.body.playmatName, req.body.playmatPass, req.body.playerName, (obj) => {
		fs.readFile('./static/table.html', 'utf8', (err, data) => {
			if (err) {
				res.send(err);
			} else {
				var initialData = '\n\t\t'+ input('initialData',JSON.stringify(obj.objects).replace(/"/g, '&quot;'));
				data = data.replace(input('playmatId','-1'),input('playmatId',obj.id)+initialData);
				res.end(data);
			}
		});
	});
}