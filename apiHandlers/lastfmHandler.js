var LastFmNode = require("lastfm").LastFmNode;
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = class LastFMHandler {
  constructor() {}

  static async update(last_accessed) {
    console.log("Updating lastfm...");
    // console.log(process.env.MONGODB_URI);

    // Call the LastFM API
    // Keep adding items until they become older then last accessed
    // If success, do:
    // res = await APILastUpdatedHandler.update("lastfm");
  }
};
