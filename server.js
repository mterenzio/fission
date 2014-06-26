// server.js

// BASE SETUP
// =============================================================================
//get config
var config   = require("./conf/config");
// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
// Authenticator
var client = config.client;
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
passport.use(new BasicStrategy(
  function(username, password, done) {
    if (username.valueOf() === client.user &&
      password.valueOf() === client.pass) {
        return done(null, true);
      } else {
        return done(null, false);
      }
  }
));
var fs = require('fs');
var bodyParser = require('body-parser');
var formidable = require('formidable'),http = require('http'),
    util = require('util');
var Converter=require("csvtojson").core.Converter;
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());
app.use(passport.initialize());
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
var port = process.env.PORT || 8888; 		// set our port
// mongoose connect to MongoDB
var mongoose   = require('mongoose');
var db = config.database;
mongoose.connect('mongodb://' + db.user + ':' + db.pass + '@' + db.host + ':' + db.port + '/' + db.name);
//enable CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.all('*', passport.authenticate('basic', { session: false }));
//require basic auth

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'Go Fission!' });
});

//route for models upload
router.route('/modeluploader')
  .post(function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "uploads";
    form.keepExtensions = false;
      form.parse(req, function(err, fields, files) {
        var filename = String(files.file.name);
        var filenameparts = filename.split('.');
        var modelname = filenameparts[0].replace(/^[a-z]/, function(m){ return m.toUpperCase() });
        var filecontents = fs.readFileSync(String(files.file.path));
        var newfile = "var mongoose     = require('mongoose');\n";
        var newfile = "// app/models/" + filenameparts[0] + ".js\n\n";
        newfile += "var mongoose     = require('mongoose');\n";
        newfile += "var Schema       = mongoose.Schema;\n";
        newfile += "var " + modelname + "Schema   = new Schema(";
        newfile += filecontents;
        newfile += ");\n";
        newfile += "module.exports = mongoose.model('" + modelname + "', " + modelname + "Schema);"
        //var oldpath = String(__dirname + '/' + );
        var newpath = String(__dirname + '/app/models/' + files.file.name);
        fs.writeFileSync(newpath, newfile);
        //fs.renameSync(oldpath, newpath);
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });

  })
//render file upload form
  .get(function(req, res) {
    res.render("upload_form.jade");
  });
//route for data upload
router.route('/datauploader')
  .post(function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "uploads";
    form.keepExtensions = true;
      form.parse(req, function(err, fields, files) {
        //Converter Class
        var Converter=require("csvtojson").core.Converter;
        var fs=require("fs");

        var csvFileName=String(files.file.path);
        var fileStream=fs.createReadStream(csvFileName);
        //new converter instance
        var param={};
        var csvConverter=new Converter(param);
        var filename = String(files.file.name);
        var filenameparts = filename.split('.');
        var modelname = filenameparts[0].replace(/^[a-z]/, function(m){ return m.toUpperCase() });
        //end_parsed will be emitted once parsing finished
        csvConverter.on("end_parsed",function(jsonObj){
          //console.log(jsonObj); //here is your result json object

          for(var item in jsonObj) {
             //for (var field in ) {
               //console.log(jsonObj[item]);
               var model = './app/models/' + filenameparts[0];
               var NewsObject     = require(model);
               var newsobject = new NewsObject(jsonObj[item]);// instantiate newsobjects with post data

              // save the newsobject and check for errors
              newsobject.save(function(err) {

                if (err)
                res.send(err);
                console.log('created');
                console.log(jsonObj[item]);
                //res.json({ message: 'newsobject created!' });
              });
               //console.log(field, jsonObj[item][field]);

            //}
            //console.log(item);
          }
        });

        //read from file
        fileStream.pipe(csvConverter);
    });

  })
// render file upload form
  .get(function(req, res) {
    res.render("upload_data_form.jade");
  });
// more routes for our API will happen here

// on routes that end in /:newsobject
// ----------------------------------------------------
router.route('/:newsobject')

	// create a newsobject (accessed at POST http://localhost:8080/api/:newsobject)
	.post(function(req, res) {
    var model = './app/models/' + req.params.newsobject;
    var NewsObject     = require(model);
    var newsobject = new NewsObject(req.body);// instantiate newsobjects with post data

		// save the newsobject and check for errors
		newsobject.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'newsobject created!' });
		});

	})

	// get all the newsobjects (accessed at GET http://localhost:8080/api/newsobject)
	.get(function(req, res) {
    var model = './app/models/' + req.params.newsobject;
    var NewsObject     = require(model);
		NewsObject.find(function(err, newsobjects) {
			if (err)
				res.send(err);

			res.json(newsobjects);
		});
	});

// on routes that end in /:newsobject/:newsobject_id
// ----------------------------------------------------
router.route('/:newsobject/:newsobject_id')

	// get the newsobject with that id (accessed at GET http://localhost:8080/api/:newsobject/:newsobject_id)
	.get(function(req, res) {
    var model = './app/models/' + req.params.newsobject;
    var NewsObject     = require(model);
		NewsObject.findById(req.params.newsobject_id, function(err, newsobject) {
			if (err)
				res.send(err);
			res.json(newsobject);
		});
	})

	// update the newsobject with this id (accessed at PUT http://localhost:8080/api/newsobject/:newsobject_id)
  	.put(function(req, res) {
      var model = './app/models/' + req.params.newsobject;
      var NewsObject     = require(model);
      // use our newsobject model to find the newsobject we want
      NewsObject.findById(req.params.newsobject_id, function (err, newsobject){
			if (err) {
				res.send(err);
      } else {
        //update fields
        for (var field in NewsObject.schema.paths) {
         if ((field !== '_id') && (field !== '__v')) {
           if (req.body[field] !== undefined) {
             newsobject[field] = req.body[field];
           }
         }
       }
        //save the newsobject
        newsobject.save(function(err) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: 'Newsobject updated!' });
          }
        });
      }
    });
	})

	// delete the newsobject with this id (accessed at DELETE http://localhost:8080/api/:newsobject/:newsobject_id)
	.delete(function(req, res) {
    var model = './app/models/' + req.params.newsobject;
    var NewsObject     = require(model);
		NewsObject.remove({
			_id: req.params.newsobject_id
		}, function(err, newsobject) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

// on routes that pattern /query/:newsobject/
// ----------------------------------------------------
router.route('/query/:newsobject')

// search a newsobject (accessed at POST http://localhost:8080/api/query/:newsobject)
.post(function(req, res) {
  var model = './app/models/' + req.params.newsobject;
  var NewsObject     = require(model);
  //var newsobject = new NewsObject();// instantiate newsobjects with post data

  // return results or error
    console.log(req.body);
    //res.json(req.body);
    NewsObject.find(req.body, 'name quote', function (err, newsobject) {
  if (err) return handleError(err);
  if (newsobject != null) {
    res.json(newsobject);
  } else {
    res.json('{}');
  }

})

});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Fission reactor running on port ' + port);
