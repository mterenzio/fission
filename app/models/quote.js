// app/models/quote.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var QuoteSchema   = new Schema({
  name: String,
  quote: String,
  date: Date
}
);
module.exports = mongoose.model('Quote', QuoteSchema);