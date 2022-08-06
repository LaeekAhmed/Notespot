const express = require("express");
const router = express.Router();
const Author = require("../models/author"); //db file

// all/search authors route, async func makes working wiht mongoose easier/await feature
router.get("/", async (req, res) => {
  let searchOptions = {};
  // req.query instead of req.body since this is a get NOT post action;
  if (req.query.name != null && req.query.name !== "") {
    /* RegExp => searching for "yl" will also include "kyle","jo" will include "john"
     i => case insensitive*/
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// new author route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author Route
router.post("/", async (req, res) => {
  // new entry "author" into table "Author"
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    console.log("1",author)
    console.log("2",newAuthor)
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

module.exports = router;
