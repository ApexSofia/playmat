const controller = require ('./controller');
module.exports = function(router){
	router.get ('/getAllPlaymats', controller.getAllPlaymats);
	router.post('/createPlaymat',  controller.createPlaymat);
	router.post('/checkPassword',  controller.checkPassword);
	router.post('/removePlaymat',  controller.removePlaymat);
	router.post('/upload',         controller.upload);
	router.post('/import',         controller.importFromWeb);
	router.post('/updateToken',    controller.updateToken);
	router.post('/deleteToken',    controller.deleteToken);
	router.post('/table.html',     controller.table);
};