var express = require('express');
var router = express.Router();
var userController = require('../controllers/user'),
    storyStreamController = require('../controllers/storystream'),
    customError = require('../lib/custom_errors'),
    fs = require('fs'),
    path = require('path'),
    passport = require('passport'),
    User = require('../model/user');

module.exports.routes = function(app){
    router.post('/users/register', userController.register);
    router.post('/users/login', userController.login);

    var middleWares = [passport.authenticate('bearer', { session: false }), verifyUserModel];
    var getMiddleWares = [verifyModelExist, authenticate];
    router.post('/modeluploader', passport.authenticate('bearer', { session: false }), userController.uploadModel);
    router.get('/modeluploader',function(req, res, next){
        res.render("upload_form.jade");
    })

    router.post("/:modelname", middleWares, userController.addData);
    router.get("/:modelname/all", getMiddleWares, userController.getAllData);
    router.get("/:modelname/:id", getMiddleWares, userController.getData);
    router.put("/:modelname/:id", middleWares, userController.updateData);
    router.delete("/:modelname/:id", middleWares, userController.deleteData);
    router.post("/:modelname/query", getMiddleWares, userController.queryData);
    router.post("/storystream", passport.authenticate('bearer', { session: false }), storyStreamController.addData);
    router.get("/storystream/all", passport.authenticate('bearer', { session: false }), storyStreamController.getAllData);
    router.get("/storystream/:id", passport.authenticate('bearer', { session: false }), storyStreamController.getData);
    router.put("/storystream/:id", passport.authenticate('bearer', { session: false }), storyStreamController.updateData);
    router.delete("/storystream/:id", passport.authenticate('bearer', { session: false }), storyStreamController.deleteData);
    router.post("/storystream/query", passport.authenticate('bearer', { session: false }), storyStreamController.queryData);
    app.use('/', router);
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

function authenticate(req, res, next){
    passport.authenticate('bearer', { session: false }, function(err, user, info) {
        if (err) { return next(err); }

        if(!user){
            req["is_authenticated"] = false;
            return next();
        }

        req["is_authenticated"] = true;
        next();
    })(req, res, next);
}
