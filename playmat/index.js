const express = require('express');
const config  = require('./config');
const routes  = require('./routes');
const app     = express();
const router  = express.Router();
routes(router);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('static'));
app.use('/assets', express.static('assets'))
app.use('/', router);

app.listen(config.web.port, function() {
	console.log('Running on port '+ config.web.port);
});
