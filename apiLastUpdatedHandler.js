APILastUpdated = require("./apiLastUpdatedModel");

module.exports = class APILastUpdatedHandler {
  constructor() {}
  static async getLastUpdated(api) {
    const res = await APILastUpdated.find({ api: api });
    return res;
  }
  static async getAllLastUpdated() {
    const res = await APILastUpdated.find();
    return res;
  }
  static async update(api) {
    const res = await APILastUpdated.findOneAndUpdate(
      { api: api },
      { $set: { last_accessed: Date.now() } },
      { upsert: true, new: true, useFindAndModify: false } // Make this update into an upsert
    );
    return res;
  }
};
