const sqlite3 = require('sqlite3').verbose();

class DB_sqlite3 {
	
	playmatCreate = 'CREATE TABLE IF NOT EXISTS playmat_list (\n' +
					'creation DATE         NOT NULL,\n'  +
					'name     VARCHAR(100) NOT NULL,\n'+
					'password VARCHAR(100) NOT NULL,\n'+
					'UNIQUE   (name)\n'+
					')' ;
	
	constructor() {
		this.db = new sqlite3.Database('./db/playmat.db',  this.errorHandler('Connected to the playmat database.'));
	}
	
	errorHandler(message) {
		return function (err) {
			if (err) {
				console.error(err.message);
			}
			console.log(message);
		}
	}
	
	close(){
		this.db.close(this.errorHandler('Close the database connection.'));
	}
	
	queryPlaymatList(callback) {
		var statement = this.playmatCreate ;
		var res = { success: true, playmats: [] } ;
		this.db.serialize(() => {
			try {
				this.db.run(statement);
				this.db.all('SELECT name FROM playmat_list ORDER BY creation', [], (err, rows) => {
					if (err) {
						this.errorHandler('queryPlaymatList error')(err);
						callback ({ success:false, error:err });
					}
					rows.forEach((row) => {
						res.playmats.push({ name: row.name });
					});
					callback (res);
				});
			} catch (exception) { this.errorHandler('queryPlaymatList exception')(exception)}
		});
		this.close();
		return res ;
	}
	
	createPlaymat(name, password, callback) {
		var statement = this.playmatCreate ;
		var insertPlaymat = "INSERT INTO playmat_list (creation, name, password) VALUES (DateTime('now'),'"+name+"','"+password+"')" ; 
		this.db.serialize(() => {
			try {
				this.db.run(statement);
				this.db.run(insertPlaymat, (err, row) => {
					if (err) {
						this.errorHandler('createPlaymat error')(err);
						if (err == 'Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: playmat_list.name') {
							callback({ success: false, error : 'A playmat with this name already exists.'}) ;
						} else {
							callback({ success: false, error : err });
						}
					} else {
						callback({ success: true });
					}
				});
			} catch (exception) { this.errorHandler('createPlaymat exception')(exception)}
		});
		this.close();
	}
	
	checkPassword(name, password, callback) {
		var statement = this.playmatCreate ;
		var checkPlaymat = "SELECT rowid FROM playmat_list WHERE name='"+name+"' AND password='"+password+"'" ; 
		console.log(checkPlaymat);
		this.db.serialize(() => {
			try {
				this.db.run(statement);
				this.db.get(checkPlaymat, (err, row) => {
					if (err) {
						this.errorHandler('checkPassword error')(err);
						callback({ success: false, error : err}) ;
					} else {
						if (row == undefined) {
							callback({ success: false, error : 'Incorrect password'}) ;
						} else {
							callback({ success: true });
						}
					}
				});
			} catch (exception) { this.errorHandler('checkPassword exception')(exception)}
		});
		this.close();
	}
};

module.exports = DB_sqlite3 ;