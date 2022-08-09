if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//importing dependencies we added in package.json
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require('method-override')

//import routes/controllers
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
const bookRouter = require("./routes/books");

app.get("/here", (req, res) => {
  res.download("server.js"); //download pop-up
  console.log("here");
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride('_method'))
app.use(express.static("public"));
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

app.listen(process.env.PORT || 3000);
