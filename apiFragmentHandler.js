APIFragment = require('./apiFragmentModel');

module.exports = class APIFragmentHandler {
    constructor(brand) {
      this.carname = brand;
    }
    static async getnRecentFragments(n) {
        const res = APIFragment.find().sort({occur_date: 'descending'}).limit(parseInt(n));
        return res;
    }
    static async getFragmentsFromDate(date) {
        const res = APIFragment.find({occur_date:date}).sort({occur_date: 'descending'});
        return res;
    }
    static async insertFragment(type, image, body, occur_date) {
        var fragment = new APIFragment({ type: type, image: image, body: body, occur_date: occur_date })
        const res =fragment.save();
        return res;
    }
    static async deleteFragmentsBeforeDate(date) {
        const res = APIFragment.deleteMany({occur_date:{$lte:date}})
        return res;
    }
  }
