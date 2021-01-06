var ApiFragmentHandler = require("./apiFragmentHandler.js");
var APIManager = require("./apiManager.js");
// Import express
let express = require("express");
// Import Body parser
let bodyParser = require("body-parser");
// Import Mongoose
let mongoose = require("mongoose");
// Initialise the app
let app = express();

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://jackmorrison.xyz");
  if (process.env.NODE_ENV === "development") {
    res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var uristring = process.env.DB_URI || "mongodb://localhost/site_backend";

// Connect to Mongoose and set connection variable
mongoose.connect(uristring, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;

// Added check for DB connection
if (!db) console.log("Error connecting db");
else console.log("Db connected successfully");

// Setup server port
var port = process.env.PORT || 8080;

// Send message for default URL
app.get("/", (req, res) =>
  res.send(
    "Hello World! Available endpoints are: <br> GET /getAllFragments <br> GET /getSummary <br> POST /getSummaryForDate?date <br> POST /getAPISummaryForDate?date <br> POST /getnFragments?n <br> POST /getFragmentsFromDate?date"
  )
);

app.get("/getAllFragments", async (req, res) => {
  console.log("Getting All Fragments");
  result = await APIFragmentHandler.getnRecentFragments();
  console.log(result);
  res.send(result);
});

app.get("/forceUpdate", async (req, res) => {
  result = await APIManager.forceUpdate();
  res.send("Done!");
});

app.get("/getSummary", async (req, res) => {
  console.log("Getting Summary");
  result = await APIFragmentHandler.getnRecentFragments();

  var typeCounts = result.reduce((p, c) => {
    var name = c.type;
    if (!p.hasOwnProperty(name)) {
      p[name] = 0;
    }
    p[name] = p[name] + c.count;
    return p;
  }, {});

  console.log(typeCounts);

  res.send(typeCounts);
});

app.get("/getRecents", async (req, res) => {
  await APIManager.update();
  console.log("Getting Recents");

  const apis = [
    ["lastfm", 86400000], // Daily
    ["github", 604800000], // Weekly
    ["twitter", 604800000],
    ["instagram", 1209600000], // Fortnightly
    ["linkedin", 1209600000],
  ];
  var results = {};

  for (const item of apis) {
    result = await APIFragmentHandler.getMostRecentFragment(item[0]);

    var active = result[0]
      ? Date.now() - item[1] < result[0].occur_date
      : false;
    results[item[0]] = active;
  }
  res.send(results);
});

app.post("/getSummaryForDate", async (req, res) => {
  console.log("Getting summary for date " + req.body.date);
  result = await APIFragmentHandler.getFragmentsFromDate(req.body.date);

  var typeCounts = result.reduce((p, c) => {
    var name = c.type;
    if (!p.hasOwnProperty(name)) {
      p[name] = 0;
    }
    p[name] = p[name] + c.count;
    return p;
  }, {});

  console.log(typeCounts);
  res.send(typeCounts);
});

app.post("/getAPISummaryForDate", async (req, res) => {
  console.log("Getting API summary for date " + req.body.date);
  result = await APIFragmentHandler.getFragmentsFromDate(req.body.date);

  var apiCounts = result.reduce((p, c) => {
    var name = c.api;
    if (!p.hasOwnProperty(name)) {
      p[name] = 0;
    }
    p[name] = p[name] + c.count;
    return p;
  }, {});

  console.log(apiCounts);
  res.send(apiCounts);
});

app.get("/getSummariesByDate", async (req, res) => {
  await APIManager.update();
  console.log("Getting summaries for all dates");
  result = await APIFragmentHandler.getAPISummaryGroupedByDate();
  res.send(result);
});

app.post("/getnFragments", async (req, res) => {
  console.log("Getting " + req.body.n + " Fragments");
  result = await APIFragmentHandler.getnRecentFragments(req.body.n);
  console.log(result);
  res.send(result);
});

app.post("/getFragmentsFromDate", async (req, res) => {
  console.log("Getting fragments from date " + req.body.date);
  result = await APIFragmentHandler.getFragmentsFromDate(req.body.date);
  res.send(result);
});

app.post("/getAPIFragmentsFromDate", async (req, res) => {
  console.log(
    "Getting " + req.body.api + " fragments from date " + req.body.date
  );
  result = await APIFragmentHandler.getAPIFragmentsFromDate(
    req.body.api,
    req.body.date
  );
  res.send(result);
});

// Launch app to listen to specified port
app.listen(port, async function () {
  console.log("Running personal site API on port " + port);

  APIManager.update();

  result = await APIFragmentHandler.removeDuplicates();
  console.log(result);
});
