// app/models/News.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var NewsSchema   = new Schema({
title: String,
description: String
});
module.exports = mongoose.model('News', NewsSchema);