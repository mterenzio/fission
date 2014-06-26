// app/models/broiler.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var BroilerSchema   = new Schema(  { state: String,
    number: Number,
    liveweight: Number 
  }
);
module.exports = mongoose.model('Broiler', BroilerSchema);