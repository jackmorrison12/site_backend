var APIFragmentHandler = require("../apiFragmentHandler.js");
var APILastUpdatedHandler = require("../apiLastUpdatedHandler.js");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

var Twitter = require("twitter");

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Use this npm package: https://www.npmjs.com/package/twitter

//Remember BST again
module.exports = class TwitterHandler {
  constructor() {}

  static async update() {
    console.log("Updating twitter...");
    var res = await APIFragmentHandler.getMostRecentFragment("twitter");
    if (res.length < 1) {
      var last_id = "1014158067154513920"; // 2 weeks ago
    } else {
      var last_id = res[0].meta.id;
    }

    client.get("statuses/user_timeline", { since_id: last_id }, async function (
      error,
      tweets,
      response
    ) {
      if (error) throw error;

      for (const tweet of tweets) {
        var type = "";
        var img = "";
        var user = "";
        var retweets = 0;
        var likes = 0;

        console.log("Added Tweet: " + tweet.text);

        if (tweet.retweeted) {
          type = "retweet";
          img = tweet.retweeted_status.user.profile_image_url_https;
          user = tweet.retweeted_status.user.screen_name;
          retweets = tweet.retweeted_status.retweet_count;
          likes = tweet.retweeted_status.favorite_count;
        } else {
          type = "tweet";
          img = tweet.user.profile_image_url_https;
          user = tweet.user.screen_name;
          retweets = tweet.retweet_count;
          likes = tweet.favorite_count;
        }

        res = await APIFragmentHandler.insertFragment(
          type,
          "twitter",
          img,
          tweet.text,
          tweet.created_at,
          1,
          { id: tweet.id_str, user: user, retweets: retweets, likes: likes }
        );
        console.log(res);
      }

      var res = await APILastUpdatedHandler.update("twitter");
      console.log(res);
      await new Promise((r) => setTimeout(r, 2000));
    });
  }
};
