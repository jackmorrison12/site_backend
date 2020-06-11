module.exports = class APIManager {
  constructor() {}

  // Needs to keep track of when each API was last fetched. This can be kept in the database using a different model
  // Has external update method. This is the only thing called, and it does all the rest internally.
  // Update is called, it checks the database to see which APIs it needs to update (could have forced override)
  // Then it calls the method for each API, which itself updates the database
};
