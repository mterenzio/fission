var express = require('express');
var router = express.Router();
var userController = require('../controllers/user');

module.exports.routes = function(app){
    router.post('/users/register',userController.register);
    router.post('/users/login', userController.login);
    app.use('/api', router);

}
