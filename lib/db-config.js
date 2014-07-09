var config = require('../config/config'),
    mongoose= require("mongoose");

module.exports.connectDatabase = function(callback){
    mongoose.connect(config.get("db:mongodb:url"),config.get("db:mongodb:dbOptions"));
    var conn = mongoose.connection;

    //console.log(conn);
    conn.on('error', function(err){
        console.log(err);
        console.log('Error.. connecting to database');
        process.exit(1);
    });

    conn.once('open', function() {
        callback(conn);
    });
}

