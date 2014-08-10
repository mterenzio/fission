var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    customError = require('../lib/custom_errors');

var userSchema = new Schema({
    username: {type:String, required : true, unique: true },
    email: {type:String, required: true, unique: true },
    password: {type: String, required: true},
    apiKey: String,
    models: []
});

module.exports = mongoose.model('Users', userSchema);