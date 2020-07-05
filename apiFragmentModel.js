// apiFragmentModel.js
var mongoose = require("mongoose");
// Setup schema
var apiFragmentSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  api: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  body: {
    type: String,
    required: true,
  },
  occur_date: {
    type: Date,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  create_date: {
    type: Date,
    default: Date.now,
  },
  meta: {},
});
var APIFragment = (module.exports = mongoose.model(
  "APIFragment",
  apiFragmentSchema
));
