// apiFragmentModel.js
var mongoose = require('mongoose');
// Setup schema
var apiFragmentSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    body: String,
    occur_date: {
        type: Date
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});
// Export Contact model
var APIFragment = module.exports = mongoose.model('apiFragment',apiFragmentSchema);
module.exports.get = function (callback, limit) {
    APIFragment.find(callback).limit(limit);
}