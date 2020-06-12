// apiLastUpdatedModel.js
var mongoose = require("mongoose");
// Setup schema
var apiLastUpdatedSchema = mongoose.Schema({
  api: {
    type: String,
    required: true,
  },
  last_accessed: {
    type: Date,
    required: true,
  },
});
var APILastUpdated = (module.exports = mongoose.model(
  "APILastUpdated",
  apiLastUpdatedSchema
));
