const DB = require ('./db_sqlite3');

//import { DB_sqlite3 } from "./db_sqlite3" ;

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

