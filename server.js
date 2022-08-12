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
const fileRouter = require("./routes/file");

// download pop-up test
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

// Database connection
const mongoose = require("mongoose");
const { fileLoader } = require("ejs");

function connectDB() {
  // Database connection 🥳
  mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true});
  const connection = mongoose.connection;
  connection.once('open', () => {
      console.log('------------------------------')
      console.log('Database connected ✅');
  }).on('error',err => {
      console.log('Connection failed ⚠️');
  });
}
connectDB()

// using routes/controllers
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);
app.use("/files", fileRouter);

app.listen(process.env.PORT || 3000);
