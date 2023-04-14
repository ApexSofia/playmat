const controller = require ('./controller');
module.exports = function(router){
	router.get ('/getAllPlaymats', controller.getAllPlaymats);
	router.post('/createPlaymat',  controller.createPlaymat);
	router.post('/checkPassword',  controller.checkPassword);
	router.post('/joinPlaymat',    controller.joinPlaymat);
	router.post('/loadObject',     controller.loadObject);
	router.post('/removePlaymat',  controller.removePlaymat);
	router.post('/upload',         controller.upload);
	router.post('/table.html',     controller.table);
};