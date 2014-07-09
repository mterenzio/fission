var BearerStrategy = require('passport-http-bearer').Strategy,
    userModel = require('../model/user'),
    customError = require('../lib/custom_errors');

module.exports = function(passport){

    passport.use(new BearerStrategy({ "passReqToCallback": true },
        function(req, token, done) {
            // asynchronous validation, for effect...
            process.nextTick(function () {
                userModel.findUser({apiKey:token},function(err,user){
                    if (err) { return done(new customError.NotAuthorized("You are not authorized")); }

                    req["userId"] = user._id.toString();
                    return done(null, user);
                })
            });
        }
    ));
}