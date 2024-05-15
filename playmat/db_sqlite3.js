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
		console.log('Connecting to the playmat database.');
		this.db = new sqlite3.Database('./db/playmat.db', this.errorHandler('Connection error'));
	}
	
	errorHandler(message, callback) {
		return function (err) {
			if (err) {
				console.log(message);
				console.error(err.code||err.message||err);
				if (callback != undefined) {
					callback({ success: false, error:(err.code||err.message||err) });
				}
			}
		}
	}
	
	set(method, callback){
		console.log('Executing ' + method + '...');
		this.message  = method;
		this.callback = callback;
	}
	
	run(type, query, params, success, failure) {
		var handler = (err, row) => {
			if (err) {
				this.errorHandler('Error executing '+ this.message, this.callback)(err);
				if (failure != undefined) {
					try {
						failure(row);
					} catch (exception) { 
						this.errorHandler('Exception executing ' + this.method, this.callback)(exception);
					}
				}
			} else {
				if (success != undefined) {
					try {
						success(row);
					} catch (exception) { 
						this.errorHandler('Exception executing ' + this.method, this.callback)(exception);
					}
				}
			}
		} ;
		try {
			if (type == 'run') {
				this.db.run(query, params, handler);
			}
			if (type == 'get') {
				this.db.get(query, params, handler);
			}
			if (type == 'all') {
				this.db.all(query, params, handler);
			}
		} catch (exception) { 
			this.errorHandler('Exception executing ' + this.method, callback)(exception);
		}
	}
	
	close(){
		console.log('Closing the database connection.\n');
		this.db.close(this.errorHandler('Error closing the database connection.'));
	}
	
	queryPlaymatList(callback) {
		this.set('queryPlaymatList', callback);
		var getPlaymats = "SELECT name FROM playmat_list ORDER BY creation" ;
		var res = { success: true, playmats: [] } ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('all' ,getPlaymats, [], (rows) => {
				rows.forEach((row) => {
					res.playmats.push({ name: row.name });
				});
				callback (res);
			});
		});
		this.close();
	}
	
	createPlaymat(name, password, callback) {
		this.set('createPlaymat', callback);
		var insertPlaymat = "INSERT INTO playmat_list (creation, name, password) "+
		                    "VALUES (DateTime('now'),?,?)" ; 
		this.db.serialize(() => {
			this.run('run' ,this.playmatCreate);
			this.run('run' ,insertPlaymat, [name, password], (row) => {
				callback({ success: true });
			});
		});
		this.close();
	}
	
	updatePlaymat(id, newName, newPassword, callback) {
		this.set('updatePlaymat', callback);
		var updatePlaymat = "UPDATE playmat_list SET name=?, password=? WHERE rowid=?" ;
		this.db.serialize(() => {
			this.run('run' ,this.playmatCreate);
			this.run('run' ,updatePlaymat, [newName, newPassword, id], (row) => {
				callback({ success: true });
			});
		});
		this.close();
	}
	
	removePlaymat(id, callback) {
		this.set('removePlaymat', callback);
		var deleteObjects = "DELETE FROM playmat_objects WHERE playmat=?" ;
		var deletePlaymat = "DELETE FROM playmat_list WHERE rowid=?" ;
		this.db.serialize(() => {
			this.run('run' ,this.playmatCreate);
			this.run('run' ,deleteObjects, [id]);
			this.run('run' ,deletePlaymat, [id], (row) => {
				callback({ success: true });
			});
		});
		this.close();
	}
	
	checkPassword(name, password, callback) {
		this.set('checkPassword', callback);
		var checkPlaymat = "SELECT rowid FROM playmat_list WHERE name=? AND password=?" ; 
		this.db.serialize(() => {
			this.run('run' ,this.playmatCreate);
			this.run('get' ,checkPlaymat, [name, password], (row) => {
				if (row == undefined) {
					callback({ success: false, error : 'Incorrect password'}) ;
				} else {
					callback({ success: true });
				}
			});
		});
		this.close();
	}
	
	register(playmat, alias, file, type, x, y, callback) {
		this.set('register', callback);
		var insertObject   = "INSERT INTO objects (creation, alias, name, type) "+
		                     "VALUES (DateTime('now'),? ,? ,? )" ; 
		var deleteRelation = "DELETE FROM playmat_objects WHERE type='background' AND playmat=?"
		var insertRelation = "INSERT INTO playmat_objects (creation, playmat, object, type, scale, opacity, rotate,mirror , x, y) "+
		                     "VALUES (DateTime('now'),? , (SELECT rowid FROM objects WHERE name=?), ?, '1.00', '1.0', '0.0', false, ?, ?)";
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('run', this.objectsCreate);
			this.run('run', this.playObjCreate);
			this.db.run(insertObject, [alias, file, type], (err, row) => {
				if (err) {
					this.errorHandler('register error')(err);
					if (err == 'Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: objects.name') {
						callback({ success: false, error : 'An object with this name already exists.'}) ;
					} else {
						callback({ success: false, error : err });
					}
					this.close();
				} else {
					this.db.serialize(() => {
						if (type == 'background') {
							this.run('run', deleteRelation, [playmat]);
							x = 0 ;
							y = 0 ;
						}
						this.run('run', insertRelation, [playmat, file, type, x, y]);
						this.run('all', this.getAllObjects, [playmat], (rows) => {
							rows.forEach((row) => {
								res.objects.push(row);
							});
							callback (res);
						});
					});
					this.close();
				}
			});
		});
	}
	
	updateObject(oldAlias, newAlias, newName, type, callback){
		this.set('updateObject', callback);
		var updateQuery = "UPDATE objects SET alias=?, name=? WHERE alias=?" ;
		var queryObjects = "SELECT rowid,* FROM objects WHERE type=? ORDER BY alias" 
		var res = { success: true, savedObjects: [] } ;
		this.db.serialize(() => {
			this.run('run' ,this.objectsCreate);
			this.run('run' ,this.playObjCreate);
			this.run('run' ,updateQuery, [newAlias, newName, oldAlias]);
			this.run('all' ,queryObjects, [type], (rows) => {				
				rows.forEach((row) => {
					res.savedObjects.push(row);
				});
				callback (res);
			});
		});
		this.close();
	}
	
	deleteObject(alias, type, callback){
		this.set('deleteObject', callback);
		var deleteQuery1 = "DELETE FROM playmat_objects WHERE rowid=(SELECT rowid FROM objects WHERE alias=?)" ;
		var deleteQuery2 = "DELETE FROM objects WHERE alias=?" ;
		var queryObjects = "SELECT rowid,* FROM objects WHERE type=? ORDER BY alias" 
		var res = { success: true, savedObjects: [] } ;
		this.db.serialize(() => {
			this.run('run' ,this.objectsCreate);
			this.run('run' ,this.playObjCreate);
			this.run('run' ,deleteQuery1, [alias]);
			this.run('run' ,deleteQuery2, [alias]);
			this.run('all' ,queryObjects, [type], (rows) => {
				rows.forEach((row) => {
					res.savedObjects.push(row);
				});
				callback (res);
			});
		});
		this.close();
	}
	
	reuseObject(playmat, alias, x, y, callback) {
		this.set('reuseObject', callback);
		var queryObject    = "SELECT rowid, type FROM objects WHERE alias=?";
		var deleteRelation = "DELETE FROM playmat_objects WHERE type='background' AND playmat=?"
		var insertRelation = "INSERT INTO playmat_objects (creation, playmat, object, type, scale, opacity, rotate,mirror , x, y) "+
		                     "VALUES (DateTime('now'),? , ?, ?, '1.00', '1.0', '0.0', false, ?, ?)";
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			this.run('run' ,this.playmatCreate);
			this.run('run' ,this.objectsCreate);
			this.run('run' ,this.playObjCreate);
			this.run('get' , queryObject, [alias], (row) => {
				this.db.serialize(() => {
					if (row != undefined) {
						if (row.type == 'background') {
							this.run(deleteRelation, [playmat]);
						}
						this.run('run', insertRelation, [playmat, row.rowid, row.type, x, y]);
						this.run('all' ,this.getAllObjects, [playmat], (rows) => {
							rows.forEach((row) => {
								res.objects.push(row);
							});
							callback (res);
						});
					} else {
						callback({ success: false, error : 'Object not found' });
					}
				});
				this.close();
			}, () => {
				this.close();
			});
		});
	}
	
	updateToken(playmat, id, scale, opacity, rotate, mirror, x, y, callback){
		this.set('updateToken', callback);
		var updateObject = "UPDATE playmat_objects SET scale=?, opacity=?, rotate=?, mirror=?, x=?, y=? WHERE rowid=?";
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('run', this.objectsCreate);
			this.run('run', this.playObjCreate);
			this.run('run', updateObject, [scale, opacity, rotate, mirror, x, y, id]);
			this.run('all', this.getAllObjects, [playmat], (rows) => {
				rows.forEach((row) => {
					res.objects.push(row);
				});
				callback (res);
			});
		});
		this.close();
	}
	
	deleteToken(playmat, id, callback){
		this.set('deleteToken', callback);
		var deleteObject = "DELETE FROM playmat_objects WHERE rowid=?" ;
		var res = { success: true, objects: [] } ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('run', this.objectsCreate);
			this.run('run', this.playObjCreate);
			this.run('run', deleteObject, [id]);
			this.run('all', this.getAllObjects, [playmat], (rows) => {
				rows.forEach((row) => {
					res.objects.push(row);
				});
				callback (res);
			});
		});
		this.close();
	}
	
	getObjects(type, callback){
		this.set('getObjects', callback);
		var queryObjects = "SELECT rowid,* FROM objects WHERE type=? ORDER BY alias" ;
		var res = { success: true, savedObjects: [] } ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('run', this.objectsCreate);
			this.run('run', this.playObjCreate);
			this.run('all', queryObjects, [type], (rows) => {
				rows.forEach((row) => {
					res.savedObjects.push(row);
				});
				callback (res);
			});
		});
		this.close();
	}
	
	joinPlaymat(name, password, user, callback) {
		this.set('joinPlaymat', callback);
		var checkPlaymat = "SELECT rowid FROM playmat_list WHERE name=? AND password=?" ; 
		var res = { success: true, objects:[], id: -1} ;
		this.db.serialize(() => {
			this.run('run', this.playmatCreate);
			this.run('run', this.objectsCreate);
			this.run('run', this.playObjCreate);
			this.run('get', checkPlaymat, [name, password], (row) => {
				if (row == undefined) {
					callback({ success: false, error : 'Incorrect password'}) ;
					this.close();
				} else {
					res.id = row.rowid ;
					this.run('all', this.getAllObjects, [row.rowid], (rows) => {
						rows.forEach((row) => {
							res.objects.push(row);
						});
						callback (res);
					});
					this.close();
				}
			}, () => {
				this.close();
			});
		});
	}
};

module.exports = DB_sqlite3 ;