APIFragment = require("./apiFragmentModel");

function lastSunday(month, year) {
  var d = new Date();
  var lastDayOfMonth = new Date(
    Date.UTC(year || d.getFullYear(), month + 1, 0)
  );
  var day = lastDayOfMonth.getDay();
  return new Date(
    Date.UTC(
      lastDayOfMonth.getFullYear(),
      lastDayOfMonth.getMonth(),
      lastDayOfMonth.getDate() - day
    )
  );
}

function isBST(date) {
  var d = new Date(Date.parse(date));
  var starts = lastSunday(2, d.getFullYear());
  starts.setHours(1);
  var ends = lastSunday(9, d.getFullYear());
  starts.setHours(1);
  return d.getTime() >= starts.getTime() && d.getTime() < ends.getTime();
}

module.exports = class APIFragmentHandler {
  constructor() {}
  static async getnRecentFragments(n) {
    const res = APIFragment.find()
      .sort({ occur_date: "descending" })
      .limit(parseInt(n));
    return res;
  }
  static async getMostRecentFragment(api) {
    const res = APIFragment.find({ api: api })
      .sort({ occur_date: "descending" })
      .limit(1);
    return res;
  }

  static async getFragmentsFromDate(date) {
    var upperDate = new Date(Date.parse(date) + 86400000);
    if (isBST(date)) {
      date = new Date(Date.parse(date) - 3600000);
      upperDate = new Date(Date.parse(date) + 86400000);
    }
    const res = APIFragment.find({
      occur_date: { $gte: date, $lt: upperDate },
    }).sort({
      occur_date: "descending",
    });
    return res;
  }
  static async insertFragment(type, api, image, body, occur_date) {
    var fragment = new APIFragment({
      type: type,
      api: api,
      image: image,
      body: body,
      occur_date: occur_date,
    });
    const res = fragment.save();
    return res;
  }
  static async deleteFragmentsBeforeDate(date) {
    const res = APIFragment.deleteMany({ occur_date: { $lte: date } });
    return res;
  }
};
