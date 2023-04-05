const controller = require ('./controller');
module.exports = function(router){
	router.get ('/getAllPlaymats', controller.getAllPlaymats);
	router.post('/checkPassword',  controller.checkPassword);
	router.post('/createPlaymat',  controller.createPlaymat);
	router.post('/joinPlaymat',    controller.joinPlaymat);
	router.post('/loadObject',     controller.loadObject);
	

};