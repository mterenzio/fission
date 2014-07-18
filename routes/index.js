var express = require('express');
var router = express.Router();
var userController = require('../controllers/user'),
    customError = require('../lib/custom_errors'),
    fs = require('fs'),
    path = require('path'),
    passport = require('passport'),
    User = require('../model/user');

module.exports.routes = function(app){
    router.post('/users/register', userController.register);
    router.post('/users/login', userController.login);

    var middleWares = [passport.authenticate('bearer', { session: false }), verifyUserModel];
    router.post('/modeluploader', passport.authenticate('bearer', { session: false }), userController.uploadModel);
    router.get('/modeluploader',function(req, res, next){
        res.render("upload_form.jade");
    })

    router.post("/:modelname", middleWares, userController.addData);
    router.get("/:modelname/all", verifyModelExist, userController.getAllData);
    router.get("/:modelname/:id", verifyModelExist, userController.getData);
    router.put("/:modelname/:id", middleWares, userController.updateData);
    router.delete("/:modelname/:id", middleWares, userController.deleteData);
    router.post("/:modelname/query", verifyModelExist, userController.queryData);
    app.use('/api', router);
}

function verifyUserModel(req, res, next){
    User.findOne({_id: req.userId}, function(err, user){
        var index = user.models.indexOf(req.params.modelname);
        if(index > -1){
            var modelName = req.params.modelname.replace(/^[a-z]/, function(m){ return m.toUpperCase() });
            req.model = require('../model/'+modelName);
            next();
        }
        else
            next(new customError.NotAuthorized("You are not authorized."));
    })
}

function verifyModelExist(req, res, next){
    var modelName = req.params.modelname.replace(/^[a-z]/, function(m){ return m.toUpperCase() });
    var filePath = path.join('./model/'+modelName+".js");
    fs.exists(filePath, function(exist){
        if(exist){
            req.model = require('../model/'+modelName);
            next();
        }
        else
        next(new customError.InvalidArgument("Model does not exist"));
    })
}