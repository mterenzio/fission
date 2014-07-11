var express = require('express'),
    config = require('./config/config'),
    http = require('http'),
    db = require('./lib/db-config'),
    passport = require('passport'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    compress = require('compression'),
    errorHandler = require('errorhandler'),
    busboy = require('connect-busboy'),
    bodyParser = require('body-parser');


var env = process.env.NODE_ENV || 'development';

/**
 * Process level exception catcher
 */

process.on('uncaughtException', function (err) {
    console.log("Node NOT Exiting...");
    console.log(err);
    console.log(err.stack)
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
}

var app = express();

db.connectDatabase(function(db){

    /**
     * Passport.js intiallization
     */
    require('./lib/passport-config')(passport);

    /**
     * Express Configuration
     */
    app.use(logger('dev'));
    app.use(compress());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(bodyParser());
    app.use(busboy());
    app.use(allowCrossDomain);
    app.use(passport.initialize());
    app.engine('jade', require('jade').__express);
    //app.use(express.static(__dirname + '/public'));


    if ( env === "development" ){
        app.use(
            errorHandler({
                dumpExceptions: true,
                showStack: true
            })
        )
    } else {
        app.use(
            errorHandler()
        )
    };

    //register routes
    require('./routes').routes(app);
    //configureControllers(app);

    // Setup Express error handler middleware!
    app.use(function(err, req, res, next){
        res.send(err.code,{error:err});
    });

    /**
     * Start http server here
     */
    var server = http.createServer(app);
    server.listen(process.env.PORT ? process.env.PORT : config.get('main:port'));
    console.log("Listening on " + config.get('main:port'));
})