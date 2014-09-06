var BearerStrategy = require('passport-http-bearer').Strategy,
    User = require('../model/user'),
    customError = require('../lib/custom_errors');

module.exports = function(passport){

    passport.use(new BearerStrategy({ "passReqToCallback": true },
        function(req, token, done) {
            // asynchronous validation, for effect...
            process.nextTick(function () {
                console.log(token);
                User.findOne({apiKey:token},function(err,user){
                    if (err || user==null) { return done(new customError.NotAuthorized("You are not authorized")); }

                    console.log(user);
                    req["userId"] = user._id;
                    return done(null, user);
                })
            });
        }
    ));
}