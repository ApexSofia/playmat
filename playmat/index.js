const express = require('express');
const routes  = require('./routes');
const port    = 8000 ; 
const app     = express();
const router  = express.Router();
routes(router);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('static'));
app.use('/assets', express.static('assets'))
app.use('/', router);

app.listen(port, function() {
	console.log('Running on port '+ port);
});