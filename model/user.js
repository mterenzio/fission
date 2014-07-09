var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    customError = require('../lib/custom_errors');

var userSchema = new Schema({
    userName: {type:String, required : true},
    email: {type:String},
    apiKey: String
});

var userModel = mongoose.model('Users', userSchema);
module.exports.modelUser = userModel;

module.exports.registerUser = function(data, callback){
    new userModel(data).save(function(err, user){
        if(err)
            return callback(new customError.Database(err.toString()),null);

        callback(null,user);
    })
}

module.exports.findUser = function(condition, callback){
    userModel.findOne(condition,function(err, user){
        if (err || user==null)
            return callback(new customError.Database(err ? err.toString() : "user does not exist"),null);

        callback(null, user);
    })
}