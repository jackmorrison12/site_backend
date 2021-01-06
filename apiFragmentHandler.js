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

  static async getAPIFragmentsFromDate(api, dateNum) {
    dateNum = 13 - dateNum;
    var d = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    d = Date.parse(d) - 86400000 * dateNum;
    var date = new Date(d).setUTCHours(0, 0, 0, 0);
    if (isBST(new Date(d))) {
      if (new Date(d).getHours() === 0) {
        d = d - 82800000;
      } else {
        d = d - 86400000;
      }
      date = new Date(d).setUTCHours(23, 0, 0, 0);
    }
    var upperDate = new Date(date + 86400000);
    date = new Date(date);
    var upperDate = new Date(Date.parse(date) + 86400000);
    const res = APIFragment.find({
      occur_date: { $gte: date, $lt: upperDate },
      api: api,
    }).sort({
      occur_date: "descending",
    });
    return res;
  }

  static async getSummaryGroupedByDate() {
    var d = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    var date = new Date(d).setUTCHours(0, 0, 0, 0);
    if (isBST(d)) {
      if (new Date(d).getHours() === 0) {
        d = Date.parse(d) - 82800000;
      } else {
        d = Date.parse(d) - 86400000;
      }
      date = new Date(d).setUTCHours(23, 0, 0, 0);
    }
    var upperDate = new Date(date + 86400000);
    date = new Date(date);
    var result = await APIFragmentHandler.getnRecentFragments();
    var data = [];
    var i = 0;
    for (var i = 0; i < 14; i++) {
      data[i] = {};
    }
    i = 0;
    var count = 0;
    for (const item of result) {
      if (date <= item.occur_date && item.occur_date < upperDate) {
        data[i][item.type]
          ? (data[i][item.type] += item.count)
          : (data[i][item.type] = item.count);
        count++;
      } else {
        while (date > item.occur_date || item.occur_date >= upperDate) {
          upperDate = new Date(upperDate - 86400000);
          date = new Date(date - 86400000);
          i++;
        }
        if (i >= 14) {
          break;
        }
        data[i][item.type]
          ? (data[i][item.type] += item.count)
          : (data[i][item.type] = item.count);
        count++;
      }
    }

    return data;
  }

  static async getAPISummaryGroupedByDate() {
    var d = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    var date = new Date(d).setUTCHours(0, 0, 0, 0);
    if (isBST(d)) {
      if (new Date(d).getHours() === 0) {
        d = Date.parse(d) - 82800000;
      } else {
        d = Date.parse(d) - 86400000;
      }
      date = new Date(d).setUTCHours(23, 0, 0, 0);
    }
    var upperDate = new Date(date + 86400000);
    date = new Date(date);
    var result = await APIFragmentHandler.getnRecentFragments();
    var data = [];
    var i = 0;
    for (var i = 0; i < 14; i++) {
      data[i] = {};
    }
    i = 0;
    var count = 0;
    console.log(date);
    console.log(upperDate);
    for (const item of result) {
      if (date <= item.occur_date && item.occur_date < upperDate) {
        data[i][item.api]
          ? (data[i][item.api] += item.count)
          : (data[i][item.api] = item.count);
        count++;
      } else {
        while (date > item.occur_date || item.occur_date >= upperDate) {
          upperDate = new Date(upperDate - 86400000);
          date = new Date(date - 86400000);
          i++;
        }
        if (i >= 14) {
          break;
        }
        data[i][item.api]
          ? (data[i][item.api] += item.count)
          : (data[i][item.api] = item.count);
        count++;
      }
    }

    return data;
  }

  static async insertFragment(type, api, image, body, occur_date, count, meta) {
    var fragment = new APIFragment({
      type: type,
      api: api,
      image: image,
      body: body,
      occur_date: occur_date,
      count: count,
      meta: meta,
    });
    const res = fragment.save();
    return res;
  }
  static async deleteFragmentsBeforeDate(date) {
    const res = APIFragment.deleteMany({ occur_date: { $lte: date } });
    return res;
  }
  static async deleteFragmentsFromAPI(api) {
    const res = APIFragment.deleteMany({ api: api });
    return res;
  }

  static async removeDuplicates() {
    const res = await APIFragment.find().sort({ occur_date: "descending" });
    for (const doc of res) {
      var res2 = await APIFragment.deleteOne({
        _id: { $gt: doc._id },
        occur_date: {
          $gt: new Date(Date.parse(doc.occur_date) - 6000),
          $lt: new Date(Date.parse(doc.occur_date) + 6000),
        },
        body: doc.body,
      });
      if (res2.n > 0) {
        console.log(res2);
      }
    }
  }
};
