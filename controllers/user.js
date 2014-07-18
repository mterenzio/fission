var uuid = require('node-uuid'),
    customError = require('../lib/custom_errors'),
    passwordHash = require('password-hash'),
    fs = require('fs'),
    path = require('path'),
    User = require('../model/user');

module.exports = {
    register: function(req, res, next){
        var data = req.body;
        var u = new User(data);
        u.apiKey = uuid.v1();
        u.password = passwordHash.generate(data.password);
        u.save(function(err){
            if(err)
                return next(new customError.Database(err));

            res.send({status:"User have been registered successfully."})
        })
    },

    login: function(req, res, next){
        var data = req.body;

        User.findOne({email: data.email}, function(err, user){
            if(err)
                return next(new customError.Database(err));

            if(user==null)
                return next(new customError.InvalidCredentials("Email is not correct"));

            if(!passwordHash.verify(data.password, user.password))
                return next(new customError.InvalidCredentials("Password is incorrect"));

            res.send({status:"Credentials verified.", apiKey: user.apiKey});
        })
    },

    uploadModel: function(req, res, next){
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            var filePath = './uploads/' + filename;
            fstream = fs.createWriteStream(filePath);
            file.pipe(fstream);
            fstream.on('close', function () {
                var fileContents = fs.readFileSync(filePath);
                var filenameParts = filename.split('.');
                var modelName = filenameParts[0].replace(/^[a-z]/, function(m){ return m.toUpperCase() });
                User.findOne({_id: req.userId}, function(err, user){
                    if(err || user == null)
                        return next(new customError.Database("User does not exist"));

                    var index = user.models.indexOf(modelName);
                    if(index > -1)
                        return next(new customError.InvalidContent("You have already created model with same name"));

                    var newfile = "// app/models/" + modelName + ".js\n\n";
                    newfile += "var mongoose     = require('mongoose');\n";
                    newfile += "var Schema       = mongoose.Schema;\n";
                    newfile += "var " + modelName + "Schema   = new Schema(";
                    newfile += fileContents;
                    newfile += ");\n";
                    newfile += "module.exports = mongoose.model('" + modelName + "', " + modelName + "Schema);"
                    var target_path = path.join("./model/", modelName+".js");

                    fs.writeFileSync(target_path, newfile);
                    fs.unlink(filePath, function(err) {
                        user.models.push(modelName.toLowerCase());
                        user.save(function(err){
                            res.send({status:"Model has been created."});
                        })
                    });
                })
            })
        })
    },

    addData: function(req, res, next){
        var model = req.model;
        new model(req.body).save(function(err, objectCreated){
            if(err)
            return next(new customError.Database(err));

            res.send(objectCreated);
        })
    },

    getAllData: function(req, res, next){
        var model = req.model;
        model.find({}, function(err, results){
            res.send(results);
        })
    },

    getData: function(req, res, next){
        var model = req.model;
        model.findOne({_id: req.params.id}, function(err, result){
            if(err)
                return next(new customError.Database(err));

            if(result==null)
            return next(new customError.InvalidArgument("Data does not exist."));

            res.send(result);
        })
    },

    updateData: function(req, res, next){
        var model = req.model;
        model.findOne({_id: req.params.id}, function(err, result){
            if(err)
                return next(new customError.Database(err));

            if(result==null)
                return next(new customError.InvalidArgument("Data does not exist."));

            var data = req.body;
            for(var key in data){
                if(result[key])
                result[key] = data[key];
            }

            result.save(function(err, updatedRecord){
                if(err)
                    return next(new customError.Database(err));

                res.send(updatedRecord);
            })
        })
    },

    deleteData: function(req, res, next){
        var model = req.model;
        model.findOne({_id: req.params.id}, function(err, result){
            if(err)
                return next(new customError.Database(err));

            if(result==null)
                return next(new customError.InvalidArgument("Data does not exist."));

            result.remove(function(err){
                if(err)
                    return next(new customError.Database(err));

                res.send({status: "Record has been deleted."})
            })
        })
    },

    queryData: function(req, res, next){
        var model = req.model;
        model.find(req.body, function(err, results){
            if(err)
                return next(new customError.Database(err));

            res.send(results);
        })
    }
}