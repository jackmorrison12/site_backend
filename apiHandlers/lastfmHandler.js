module.exports = class LastFMHandler {
  constructor() {}

  static async update(last_accessed) {
    console.log("Updating lastfm...");

    // Call the LastFM API
    // Keep adding items until they become older then last accessed
    // If success, do:
    // res = await APILastUpdatedHandler.update("lastfm");
  }
};
