var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var storyStreamSchema = new Schema({
    title: String,
    description: String,
    date_created: {type: Date, default: Date.now()},
    date_updated: {type: Date, default: Date.now()},
    items: [{
        item: {type: Schema.Types.ObjectId},
        item_type: String,
        date: {type: Date, default: Date.now()}
        }]
});

module.exports = mongoose.model('StoryStreams', storyStreamSchema);