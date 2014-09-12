var uuid = require('node-uuid'),
    customError = require('../lib/custom_errors'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    storyStreamModel = require('../model/StoryStream');

module.exports = {

    addData: function(req, res, next){
        var model = storyStreamModel;
        new model(req.body).save(function(err, objectCreated){
            if(err)
                return next(new customError.Database(err));

            res.send(objectCreated);
        })
    },

    getAllData: function(req, res, next){
        var model = storyStreamModel;
        var offset = req.query.offset ? req.query.offset : 0;
        var limit = req.query.limit ? req.query.limit : 50;
        model.find(
            {},
            {skip: offset*limit, limit: limit, sort:{date_created:-1}},
            function(err, results){
            if(err)
                return next(new customError.Database(err));

            async.forEach(results, function(storyStream, cb){
                async.forEach(storyStream.items, function(item, itemCb){
                    if(item.item_type){
                        getModel(item.item_type, function(err, model){
                            if(err)
                                itemCb();
                            else{
                                model.populate(item, {path:'item'}, function(err, newItem){
                                    console.log(newItem);
                                    itemCb();
                                })
                            }
                        })
                    }
                    else
                        itemCb();
                },function(err, results){
                    cb();
                })
            },function(err, result){
                res.send(results);
            })
        })
    },

    getData: function(req, res, next){
        var model = storyStreamModel;
        model.findOne({_id: req.params.id}, function(err, result){
            if(err)
                return next(new customError.Database(err));

            if(result==null)
                return next(new customError.InvalidArgument("Data does not exist."));

            async.forEach(result.items, function(item, itemCb){
                if(item.item_type){
                    getModel(item.item_type, function(err, model){
                        if(err)
                            itemCb();
                        else{
                            model.populate(item, {path:'item'}, function(err, newItem){
                                console.log(newItem);
                                itemCb();
                            })
                        }
                    })
                }
                else
                    itemCb();
            },function(err, results){
                res.send(result);
            })
        })
    },

    updateData: function(req, res, next){
        var model = storyStreamModel;
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
        var model = storyStreamModel;
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
        var model = storyStreamModel;
        var offset = req.query.offset ? req.query.offset : 0;
        var limit = req.query.limit ? req.query.limit : 50;
        var data = req.body;
        var sortCondition = data.sort ? data.sort : {date_created:-1};
        model.find(
            data,
            {},
            {skip: offset*limit, limit: limit, sort:sortCondition},
            function(err, results){
            if(err)
                return next(new customError.Database(err));

            async.forEach(results, function(storyStream, cb){
                async.forEach(storyStream.items, function(item, itemCb){
                    if(item.item_type){
                        getModel(item.item_type, function(err, model){
                            if(err)
                                itemCb();
                            else{
                                model.populate(item, {path:'item'}, function(err, newItem){
                                    console.log(newItem);
                                    itemCb();
                                })
                            }
                        })
                    }
                    else
                        itemCb();
                },function(err, results){
                    cb();
                })
            },function(err, result){
                res.send(results);
            })
        })
    }
}

function getModel(modelName, callback){
    var modelName = modelName.replace(/^[a-z]/, function(m){ return m.toUpperCase() });
    var filePath = path.join('./model/'+modelName+".js");
    fs.exists(filePath, function(exist){
        console.log(exist);
        if(exist){
            callback(null, require('../model/'+modelName));
        }
        else
            callback(new customError.InvalidArgument("Model does not exist."), null);
    })
}
