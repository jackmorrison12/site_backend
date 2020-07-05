var APIFragmentHandler = require("../apiFragmentHandler.js");
var APILastUpdatedHandler = require("../apiLastUpdatedHandler.js");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

//Remember BST again
module.exports = class TwitterHandler {
  constructor() {}

  static async update() {
    console.log("Updating twitter...");
    var res = await APIFragmentHandler.getMostRecentFragment("twitter");
    if (res.length < 1) {
      var last_date = new Date(Date.now() - 1209600000); // 2 weeks ago
    } else {
      var last_date = Date.parse(res[0].occur_date) + 1;
    }

    // res = await APIFragmentHandler.insertFragment(
    //   type,
    //   "twitter",
    //   null,
    //   message,
    //   item.created_at,
    //   count
    // );
    // console.log(res);

    // var res = await APILastUpdatedHandler.update("twitter");
    console.log(res);
  }
};
