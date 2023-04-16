const sqlite3 = require('sqlite3').verbose();

class DB_sqlite3 {
	
	playmatCreate = "CREATE TABLE IF NOT EXISTS playmat_list (\n"+
					"creation DATE         NOT NULL,\n"+
					"name     VARCHAR(100) NOT NULL,\n"+
					"password VARCHAR(100) NOT NULL,\n"+
					"UNIQUE   (name))";
					
	objectsCreate = "CREATE TABLE IF NOT EXISTS objects (\n"+
					"creation DATE         NOT NULL, \n"+
					"alias    VARCHAR(100) NOT NULL, \n"+
					"name     VARCHAR(100) NOT NULL, \n"+
					"type     VARCHAR(20)  NOT NULL, \n"+
					"UNIQUE   (alias),\n"+
					"UNIQUE   (name))";
					
	playObjCreate = "CREATE TABLE IF NOT EXISTS playmat_objects (\n"+
					"creation DATE         NOT NULL, \n"+
					"playmat  INT          NOT NULL, \n"+
					"object   INT          NOT NULL, \n"+
					"type     VARCHAR(20)  NOT NULL, \n"+
					"scale    DECIMAL(5,2) NOT NULL, \n"+
					"opacity  DECIMAL(1,2) NOT NULL, \n"+
					"rotate   DECIMAL(3,2) NOT NULL, \n"+
					"mirror   INT          NOT NULL, \n"+
					"x        INT          NOT NULL, \n"+
					"y        INT          NOT NULL, \n"+
					"UNIQUE   (playmat, object),\n"+
					"FOREIGN KEY(playmat) REFERENCES playmat_list(rowid),\n"+
					"FOREIGN KEY(object)  REFERENCES objects(rowid))";
					
	getAllObjects = "SELECT playmat_objects.rowid, \n"+
	                "       playmat_objects.type, \n"+
					"       playmat_objects.scale, \n"+
					"       playmat_objects.opacity, \n"+
					"       playmat_objects.rotate, \n"+
					"       playmat_objects.mirror, \n"+
					"       playmat_objects.x, \n"+
					"       playmat_objects.y, \n"+
					"       objects.name \n"+
		            "FROM playmat_objects LEFT JOIN objects "+
					"ON playmat_objects.object = objects.rowid WHERE playmat=?";
					
	
	constructor() {
		this.db = new sqlite3.Database('./db/playmat.db', this.errorHandler('Connected to the playmat database.'));
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
		console.log('Executing queryPlaymatList...');
		var getPlaymats = 'SELECT name FROM playmat_list ORDER BY creation' ;
		var res = { success: true, playmats: [] } ;
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.all(getPlaymats, [], (err, rows) => {
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
	}
	
	createPlaymat(name, password, callback) {
		console.log('Executing createPlaymat...');
		var insertPlaymat = "INSERT INTO playmat_list (creation, name, password) "+
		                    "VALUES (DateTime('now'),?,?)" ; 
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.run(insertPlaymat, [name, password], (err, row) => {
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
		console.log('Executing checkPassword...');
		var checkPlaymat = "SELECT rowid FROM playmat_list WHERE name=? AND password=?" ; 
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.get(checkPlaymat, [name, password], (err, row) => {
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
	
	register(playmat, alias, file, type, x, y, callback) {
		// ToDo: Re-do this method, is aweful, it's not properly nested, and rage filled.
		
		console.log('Executing register...');
		var insertObject   = "INSERT INTO objects (creation, alias, name, type) "+
		                     "VALUES (DateTime('now'),? ,? ,? )" ; 
		var deleteRelation = "DELETE FROM playmat_objects WHERE type='background' AND playmat=?"
		var insertRelation = "INSERT INTO playmat_objects (creation, playmat, object, type, scale, opacity, rotate,mirror , x, y) "+
		                     "VALUES (DateTime('now'),? , (SELECT rowid FROM objects WHERE name=?), ?, '1.00', '1.0', '0.0', false, ?, ?)";
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.run(this.objectsCreate);
				this.db.run(this.playObjCreate);
				this.db.run(insertObject, [alias, file, type], (err, row) => {
					if (err) {
						this.errorHandler('register error')(err);
						if (err == 'Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: objects.name') {
							callback({ success: false, error : 'An object with this name already exists.'}) ;
						} else {
							callback({ success: false, error : err });
						}
					}
				});
				if (type == 'background') {
					this.db.run(deleteRelation, [playmat]);
					x = 0 ;
					y = 0 ;
				}
				this.db.run(insertRelation, [playmat, file, type, x, y], (err, row) => {
					if (err) {
						this.errorHandler('register error')(err);
						callback({ success: false, error : err });
					}
				});
				this.db.all(this.getAllObjects, [playmat], (err, rows) => {
					if (err) {
						this.errorHandler('register error')(err);
						callback({ success: false, error : err });
					} else {
						rows.forEach((row) => {
							res.objects.push(row);
						});
						callback (res);
					}
				});
				
			} catch (exception) { this.errorHandler('register exception')(exception)}
		});
		this.close();
	}
	
	updateToken(playmat, id, scale, opacity, rotate, mirror, x, y, callback){
		console.log('Executing updateToken...');
		var updateObject = "UPDATE playmat_objects SET scale=?, opacity=?, rotate=?, mirror=?, x=?, y=? WHERE rowid=?";
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.run(this.objectsCreate);
				this.db.run(this.playObjCreate);
				this.db.run(updateObject, [scale, opacity, rotate, mirror, x, y, id], (err, row) => {
					if (err) {
						this.errorHandler('updateToken error')(err);
						callback({ success: false, error : err });
					}
				});
				this.db.all(this.getAllObjects, [playmat], (err, rows) => {
					if (err) {
						this.errorHandler('updateToken error')(err);
						callback({ success: false, error : err });
					} else {
						rows.forEach((row) => {
							res.objects.push(row);
						});
						callback (res);
					}
				});
			} catch (exception) { this.errorHandler('updateToken exception')(exception)}
		});
		this.close();
	}
	
	deleteToken(playmat, id, callback){
		console.log('Executing deleteToken...');
		var deleteObject = "DELETE FROM playmat_objects WHERE rowid=?" ;
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.run(this.objectsCreate);
				this.db.run(this.playObjCreate);
				this.db.run(deleteObject, [id], (err, row) => {
					if (err) {
						this.errorHandler('deleteToken error')(err);
						callback({ success: false, error : err });
					}
				});
				this.db.all(this.getAllObjects, [playmat], (err, rows) => {
					if (err) {
						this.errorHandler('deleteToken error')(err);
						callback({ success: false, error : err });
					} else {
						rows.forEach((row) => {
							res.objects.push(row);
						});
						callback (res);
					}
				});
			} catch (exception) { this.errorHandler('deleteToken exception')(exception)}
		});
		this.close();
	}
	
	joinPlaymat(name, password, user, callback) {
		console.log('Executing joinPlaymat...');
		var checkPlaymat = "SELECT rowid FROM playmat_list WHERE name=? AND password=?" ; 
		var res = { success: true, objects:[], id: -1} ;
		this.db.serialize(() => {
			try {
				this.db.run(this.playmatCreate);
				this.db.run(this.objectsCreate);
				this.db.run(this.playObjCreate);
				var test = this.db.get(checkPlaymat, [name, password], (err, row) => {
					if (err) {
						this.errorHandler('joinPlaymat error')(err);
						callback({ success: false, error : err}) ;
						this.close();
					} else {
						if (row == undefined) {
							callback({ success: false, error : 'Incorrect password'}) ;
							this.close();
						} else {
							res.id = row.rowid ;
							this.db.all(this.getAllObjects, [row.rowid], (err, rows) => {
								if (err) {
									this.errorHandler('joinPlaymat error')(err);
									callback({ success: false, error : err });
									this.close();
								} else {
									rows.forEach((row) => {
										res.objects.push(row);
									});
									callback (res);
									this.close();
								}
							});
						}
					}
				});
			} catch (exception) { this.errorHandler('joinPlaymat exception')(exception)}
		});
		
	}
};

module.exports = DB_sqlite3 ;