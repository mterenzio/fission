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
                return next(new customError.Database("User already exist with either same username or email."));

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
                User.findOne({models:modelName}, function(err, user){
                    if(err || user!=null)
                        return next(new customError.Database("Model already exist with same name."));
                    User.findOne({_id: req.userId}, function(err, user){
                        if(err || user == null)
                            return next(new customError.Database("User does not exist"));

                        if(modelName.toLowerCase() == "storystream")
                            return next(new customError.InvalidContent("You can not create model with this name its reserved."));

                        var index = user.models.indexOf(modelName.toLowerCase());
                        if(index > -1)
                            return next(new customError.InvalidContent("You have already created model with same name"));

                        fileContents += ",\nis_public: {type:Boolean, default:true},";
                        fileContents += "\ndate_created: {type:Date, default: Date.now()},";
                        fileContents += "\ndate_updated: {type:Date, default: Date.now()},";
                        fileContents += "\nid_creator: {type: Schema.Types.ObjectId, ref:'Users'}";
                        var newfile = "// app/models/" + modelName + ".js\n\n";
                        newfile += "var mongoose     = require('mongoose');\n";
                        newfile += "var Schema       = mongoose.Schema;\n";
                        newfile += "var " + modelName + "Schema   = new Schema({";
                        newfile += fileContents;
                        newfile += "});\n";
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
        })
    },

    addData: function(req, res, next){
        var model = req.model;
        var data = req.body;
        data["id_creator"] = req.userId;

        new model(data).save(function(err, objectCreated){
            if(err)
            return next(new customError.Database(err));

            res.send(objectCreated);
        })
    },

    getAllData: function(req, res, next){
        var model = req.model;
        var condition = {};
        var offset = req.query.offset ? req.query.offset : 0;
        var limit = req.query.limit ? req.query.limit : 50;
        if(req.is_authenticated)
        condition = {
            $or:[
                {is_public:true},
                {id_creator:req.userId, is_public:false}
            ]};
        else
        condition = {
            is_public:true
        };

        model.find(
            condition,
            {},
            {skip: offset*limit, limit: limit, sort:{date_created:-1}},
            function(err, results){
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

            if(req.is_authenticated)
                res.send(result);
            else{
                if(!result.is_public)
                    return next(new customError.NotAuthorized("You are not authorized to view this item."));

                res.send(result);
            }
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

            result["id_updated"] = Date.now();
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
        var data = req.body;
        var offset = req.query.offset ? req.query.offset : 0;
        var limit = req.query.limit ? req.query.limit : 50;
        var sortCondition = data.sort ? data.sort : {date_created:-1};
        model.find(
            data,
            {},
            {skip: offset*limit, limit: limit, sort:sortCondition},
            function(err, results){
            if(err)
                return next(new customError.Database(err));

            var toReturn = [];
            for(var i=0;i<results.length;i++){
                var item = results[i];
                if(req.is_authenticated){
                    if(item.is_public || item.id_creator == req.userId)
                        toReturn.push(item);
                }
                else{
                    if(item.is_public)
                        toReturn.push(item);
                }
            }
            res.send(toReturn);
        })
    }
}