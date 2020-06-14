var APIFragmentHandler = require("../apiFragmentHandler.js");
var APILastUpdatedHandler = require("../apiLastUpdatedHandler.js");

var LastFmNode = require("lastfm").LastFmNode;
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

var lastfm = new LastFmNode({
  api_key: process.env.LASTFM_API_KEY,
  secret: process.env.LASTFM_SECRET,
  useragent: "jackmorrison/v0.2 Personal Website",
});

module.exports = class LastFMHandler {
  constructor() {}

  static async update(last_accessed) {
    console.log("Updating lastfm...");
    var res = await APILastUpdatedHandler.getLastUpdated("lastfm");
    var last_accessed = Math.floor(res[0].last_accessed.getTime() / 1000);
    var request = await lastfm.request("user.getRecentTracks", {
      user: "jackmorrison12",
      from: last_accessed,
      handlers: {
        success: async function (data) {
          try {
            const totalPages = data.recenttracks["@attr"].totalPages;
            for (const item of data.recenttracks.track) {
              console.log(item);
              var time = null;
              if (item["@attr"] && item["@attr"].nowplaying) {
                time = Date.now().toString();
              } else {
                time = (item.date.uts * 1000).toString();
              }
              res = await APIFragmentHandler.insertFragment(
                "music",
                "lastfm",
                item.image[3]["#text"],
                "Listened to " + item.name + " by " + item.artist["#text"],
                time
              );
              console.log(res);
            }
            if (totalPages > 1) {
              var i = 0;
              for (i = 2; i < totalPages; i++) {
                var request = await lastfm.request("user.getRecentTracks", {
                  user: "jackmorrison12",
                  from: last_accessed,
                  page: i,
                  handlers: {
                    success: async function (inner_data) {
                      try {
                        for (const inner_item of inner_data.recenttracks
                          .track) {
                          res = await APIFragmentHandler.insertFragment(
                            "music",
                            "lastfm",
                            inner_item.image[3]["#text"],
                            "Listened to " +
                              inner_item.name +
                              " by " +
                              inner_item.artist["#text"],
                            (inner_item.date.uts * 1000).toString()
                          );
                          console.log(res);
                        }
                      } catch (err) {
                        console.log(err);
                        return;
                      }
                    },
                    error: async function (error) {
                      console.log("Error: " + error.message);
                    },
                  },
                });
              }
            }

            var res = await APILastUpdatedHandler.update("lastfm");
            console.log(res);
          } catch (err) {
            console.log(err);
            return;
          }
        },
        error: async function (error) {
          console.log("Error: " + error.message);
        },
      },
    });
  }
};
