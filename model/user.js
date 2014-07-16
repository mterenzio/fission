var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    customError = require('../lib/custom_errors');

var userSchema = new Schema({
    username: {type:String, required : true},
    email: {type:String, required: true},
    password: {type: String, required: true},
    apiKey: String,
    models: []
});

userSchema.pre("save",function(next, done) {
    var self = this;
    mongoose.models["Users"].findOne({email : self.email},function(err, user) {
        if(err) {
            done(err);
        } else if(user) {
            self.invalidate("email","email must be unique.");
            done(new customError.InvalidArgument("Email must be unique."));
        } else {
            done();
        }
    });
    next();
});

module.exports = mongoose.model('Users', userSchema);