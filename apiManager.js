var LastFMHandler = require("./apiHandlers/lastfmHandler.js");
var GithubHandler = require("./apiHandlers/githubHandler.js");
var TwitterHandler = require("./apiHandlers/twitterHandler.js");
var ApiLastUpdatedHandler = require("./apiLastUpdatedHandler.js");

module.exports = class APIManager {
  constructor() {}

  // DONE Needs to keep track of when each API was last fetched.
  // DONE This can be kept in the database using a different model
  // Has external update method. This is the only thing called, and it does all the rest internally.
  // Update is called, it checks the database to see which APIs it needs to update (could have forced override)
  // Then it calls the method for each API, which itself updates the database

  // Store name of API, min time since last update before it should be updated again (in ms) and it's API Handler class

  static async update() {
    const apis = {
      lastfm: { update_frequency: 180000, handler: LastFMHandler },
      github: { update_frequency: 1800000, handler: GithubHandler },
      twitter: { update_frequency: 1800000, handler: TwitterHandler },
    };

    const res = await ApiLastUpdatedHandler.getAllLastUpdated();
    for (const item of res) {
      if (Date.now() - apis[item.api].update_frequency > item.last_accessed) {
        console.log("Updating " + item.api);
        await apis[item.api].handler.update(item.last_accessed);
      }
    }
  }

  static async forceUpdate() {
    const apis = [
      { api: "lastfm", handler: LastFMHandler },
      { api: "github", handler: GithubHandler },
      { api: "twitter", handler: TwitterHandler },
    ];

    for (const item of apis) {
      console.log("Updating " + item.api);
      await item.handler.update();
    }
  }
};
