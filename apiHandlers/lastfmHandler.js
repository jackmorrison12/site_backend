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
    // var res = await APILastUpdatedHandler.getLastUpdated("lastfm"); // Check from last check
    // var last_accessed = Math.floor(res[0].last_accessed.getTime() / 1000);
    // last_accessed = Math.floor((Date.now()/1000) - 1209600) // Update last 2 weeks
    var res = await APIFragmentHandler.getMostRecentFragment("lastfm");
    if (res.length < 1) {
      var last_accessed = Math.floor(Date.now() / 1000 - 1209600); // Update last 2 weeks
    } else {
      var last_accessed = Math.floor(
        (Date.parse(res[0].occur_date) + 60000) / 1000
      ); // Checks from one minute after the last song was recorded
    }
    var request = await lastfm.request("user.getRecentTracks", {
      user: "jackmorrison12",
      from: last_accessed,
      handlers: {
        success: async function (data) {
          try {
            const totalPages = data.recenttracks["@attr"].totalPages;
            console.log(data.recenttracks.track);
            if (Array.isArray(data.recenttracks.track)) {
              for (const item of data.recenttracks.track) {
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
                  "Listened to '" + item.name + "' by " + item.artist["#text"],
                  time
                );
              }
            } else if (data.recenttracks.track) {
              var item = data.recenttracks.track;
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
                "Listened to '" + item.name + "' by " + item.artist["#text"],
                time
              );
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
                            "Listened to '" +
                              inner_item.name +
                              "' by " +
                              inner_item.artist["#text"],
                            (inner_item.date.uts * 1000).toString()
                          );
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
            await new Promise((r) => setTimeout(r, 2000));
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
