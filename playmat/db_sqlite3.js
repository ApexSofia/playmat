const sqlite3 = require('sqlite3').verbose();

class DB_sqlite3 {
	
	playmatCreate = 'CREATE TABLE IF NOT EXISTS playmat_list (\n' +
					'id       integer      PRIMARY KEY, \n'+
					'creation date         NOT NULL,\n'  +
					'name     varchar(100) NOT NULL,\n'+
					'password varchar(100) NOT NULL\n'+
					') WITHOUT ROWID;' ;
	
	constructor() {
		this.db = new sqlite3.Database('./db/playmat.db',  (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the playmat database.');
		});
	}
	
	close(){
		this.db.close((err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Close the database connection.');
		});		
	}
	
	queryPlaymatList() {
		var statement = this.playmatCreate ;
		var res = { playmats: [] } ;
		var db = this.db ;
		db.serialize(() => {
			db.run(statement)
			  .all('SELECT name FROM playmat_list ORDER BY creation', [], (err, rows) => {
				if (err) {
					return console.error(err.message);
				}
				rows.forEach((row) => {
					res.playmats.push({ name: row.name });
				})
			});
		});
		return res ;
	}
	
	createPlaymat(name, password) {
		var statement = this.playmatCreate ;
		var db = this.db ;
		db.serialize(() => {
			db.run(statement)
			  .get('SELECT name FROM playmat_list WHERE name="'+name+'"', (err, row) => {
				if (row != undefined) {
					return { sucess: false, error : 'A playmat with this name already exists.'} ;
				} else {
					db.run('INSERT INTO playmat_list (creation,name, password) VALUES ("now","'+name+'","'+password+'")');
					return { sucess: true };
				}
			 });
		});
	}
};

module.exports = DB_sqlite3 ;