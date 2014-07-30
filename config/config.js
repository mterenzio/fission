var nconf = require('nconf');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//

var env = process.env.NODE_ENV || 'development'

if ( env === 'development' )
	var file = './config/defaults_dev.json';
else if ( env === 'testing' )
	var file = './config/defaults_test.json';
else
	var file = './config/defaults.json';


nconf.argv()
    .env()
    .file({ file: file });

module.exports = nconf;
