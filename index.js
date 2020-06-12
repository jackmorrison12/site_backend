// import { APIFragmentHandler } from "./apiFragmentHandler"
var ApiFragmentHandler = require("./apiFragmentHandler.js");
var ApiLastUpdatedHandler = require("./apiLastUpdatedHandler.js");
// Import express
let express = require("express");
// Import Body parser
let bodyParser = require("body-parser");
// Import Mongoose
let mongoose = require("mongoose");
// Initialise the app
let app = express();

// Import routes
const APIFragmentHandler = require("./apiFragmentHandler.js");
const APILastUpdatedHandler = require("./apiLastUpdatedHandler.js");

// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

var uristring =
  process.env.MONGODB_URI ||
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  "mongodb://localhost/site_backend";

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
    "Hello World! Available endpoints are: <br> GET /getAllFragments <br> POST /getnFragments <br> POST /getFragmentsFromDate"
  )
);

app.get("/getAllFragments", async (req, res) => {
  console.log("Getting All Fragments");
  result = await APIFragmentHandler.getnRecentFragments();
  console.log(result);
  res.send(result);
});

app.get("/getSummary", async (req, res) => {
  console.log("Getting Summary");
  result = await APIFragmentHandler.getnRecentFragments();

  var typeCounts = result.reduce((p, c) => {
    var name = c.type;
    if (!p.hasOwnProperty(name)) {
      p[name] = 0;
    }
    p[name]++;
    return p;
  }, {});

  console.log(typeCounts);

  res.send(typeCounts);
});

app.post("/getSummaryForDate", async (req, res) => {
  console.log("Getting summary for date " + req.body.date);
  result = await APIFragmentHandler.getFragmentsFromDate(req.body.date);

  var typeCounts = result.reduce((p, c) => {
    var name = c.type;
    if (!p.hasOwnProperty(name)) {
      p[name] = 0;
    }
    p[name]++;
    return p;
  }, {});

  console.log(typeCounts);

  res.send(typeCounts);
});

// app.get("/getSummariesAndDates", async (req, res) => {
//   console.log("Getting summary for all dates");
//   result = await APIFragmentHandler.getnRecentFragments();

//   const dateGroups = result.reduce((acc, item) => {
//     if (!acc[item.occur_date.setHours(0, 0, 0, 0)]) {
//       acc[item.occur_date.setHours(0, 0, 0, 0)] = [];
//     }

//     acc[item.occur_date.setHours(0, 0, 0, 0)].push(item);
//     return acc;
//   }, {});

//     console.log(dateGroups);

//   var typeCounts = result.reduce((p, c) => {
//     var name = c.type;
//     if (!p.hasOwnProperty(name)) {
//       p[name] = 0;
//     }
//     p[name]++;
//     return p;
//   }, {});

//   console.log(typeCounts);

//   res.send(typeCounts);
// });

app.post("/getnFragments", async (req, res) => {
  console.log("Getting " + req.body.n + " Fragments");
  result = await APIFragmentHandler.getnRecentFragments(req.body.n);
  console.log(result);
  res.send(result);
});

app.post("/getFragmentsFromDate", async (req, res) => {
  console.log("Getting fragments from date " + req.body.date);
  result = await APIFragmentHandler.getFragmentsFromDate(req.body.date);
  console.log(result);
  res.send(result);
});

// Launch app to listen to specified port
app.listen(port, async function () {
  console.log("Running personal site API on port " + port);
  // res = await APILastUpdatedHandler.getLastUpdated("lastfm");
  // console.log(res);
  // res = await APIFragmentHandler.insertFragment(
  //   "chicken1",
  //   "lastfm",
  //   "imgurl",
  //   "body",
  //   "2020-10-02 12:50 UTC"
  // );
  // console.log(res);
});
