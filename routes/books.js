const express = require("express");
const router = express.Router();
const Book = require("../models/book"); //import db file
const Author = require("../models/author"); //import db file

/* import/methods to deal with cover image:
firstly we need to create the image file in the folder after the user uploads it,then get the name and save it
removed now */
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'] //accepted image-type list

// all-search books route
router.get("/", async (req, res) => {
    // let searchOptions = {};
    // // req.query instead of req.body since this is a get NOT post action;
    // if (req.query.title != null && req.query.title !== "") {
    //   /* RegExp => searching for "yl" will also include "kyle","jo" will include "john"
    //    i => case insensitive*/
    //   searchOptions.title = new RegExp(req.query.title, "i");
    // }
    // try{
    //     const books = await Book.find(searchOptions);
      let query = Book.find()
      if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
      }
      if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publish_date', req.query.publishedBefore)
      }
      if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publish_date', req.query.publishedAfter)
      }
      try {
        const books = await query.exec()
        res.render("books/index",{
            books : books,
            searchOptions: req.query
        });
    } catch{
        res.redirect("/");
    }
});

// new book route
router.get("/new", async (req, res) => {
    renderNewPage(res,new Book())
});

// Create book Route
router.post("/",async (req, res) => {
  // new entry "book" into table "Book"
  const book = new Book({
    title : req.body.title,
    author : req.body.author,
    publish_date : req.body.publishDate, // converting from string
    pageCount : req.body.pageCount,
    description : req.body.description
    });
    saveCover(book,req.body.cover)
  try {
    const newBook = await book.save();
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect("books");
    // if error occurs new.ejs will be reloaded without erasing the typed values.
  } catch {
    renderNewPage(res,book,true)
  }
});

async function renderNewPage(res, book,hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
        params.errorMessage = 'Error Creating Book'
    }
    //res.render(`books/${form}`, params)
    res.render('books/new',params)
  } catch {
    res.redirect('/books')
  }
}


function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    console.log('cover.data length : ',cover.data.length)
    book.coverImage = new Buffer.from(cover.data,'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router;
