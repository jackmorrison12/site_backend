var APIFragmentHandler = require("../apiFragmentHandler.js");
var APILastUpdatedHandler = require("../apiLastUpdatedHandler.js");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  userAgent: "jackmorrison.xyz v0.1",
  auth: process.env.GITHUB_API_KEY,
  timeZone: "Europe/London",
});

//Remember BST again
module.exports = class GithubHandler {
  constructor() {}

  static async update() {
    console.log("Updating github...");
    var res = await APIFragmentHandler.getMostRecentFragment("github");
    if (res.length < 1) {
      var last_date = new Date(Date.now() - 1209600000); // 2 weeks ago
    } else {
      var last_date = res[0].occur_date;
    }
    const { data } = await octokit.activity.listEventsForAuthenticatedUser({
      username: process.env.GITHUB_USERNAME,
    });
    // console.log(data);

    for (const item of data) {
      if (item.type === "PushEvent") {
        // console.log(item.payload.commits);
        var message =
          item.payload.size > 1
            ? "Pushed " +
              item.payload.size +
              " commits to the repo " +
              item.repo.name
            : "Pushed a commit to the repo " +
              item.repo.name +
              ', with message "' +
              item.payload.commits[0].message +
              '"';
        // res = await APIFragmentHandler.insertFragment(
        //   "push",
        //   "github",
        //   null,
        //   message
        //   item.created_at
        // );
      }
    }
  }
};
