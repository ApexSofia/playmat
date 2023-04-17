const controller = require ('./controller');
module.exports = function(router){
	router.get ('/getAllPlaymats', controller.getAllPlaymats);
	router.post('/createPlaymat',  controller.createPlaymat);
	router.post('/removePlaymat',  controller.removePlaymat);
	router.post('/checkPassword',  controller.checkPassword);
	router.post('/upload',         controller.upload);
	router.post('/import',         controller.importFromWeb);
	router.post('/reUseToken',     controller.reUseToken);
	router.post('/updateToken',    controller.updateToken);
	router.post('/deleteToken',    controller.deleteToken);
	router.post('/getObjects',     controller.getObjects);
	router.post('/table.html',     controller.table);
};