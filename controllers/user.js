var uuid = require('node-uuid'),
    customError = require('../lib/custom_errors'),
    passwordHash = require('password-hash'),
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
    }
}