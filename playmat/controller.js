const DB = require ('./db_sqlite3');

//import { DB_sqlite3 } from "./db_sqlite3" ;

exports.getAllPlaymats = function(req,res) {
	var db  = new DB() ;
	var obj = db.queryPlaymatList();
	db.close();
	res.send(JSON.stringify(obj));
};

exports.createPlaymat = function(req,res) {
	// * Ya existe una mesa con ese nombre
	console.log(res);
	var db  = new DB() ;
	var obj = db.createPlaymat();
	db.close();
	res.send(JSON.stringify(obj));
};

exports.checkPassword = function(req,res) {
	// * La mesa no existe
	// * Contraseña de la mesa equivocada
	res.send('');
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

