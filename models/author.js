const mongoose = require("mongoose");
const Book = require('./book')

// schema = table
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre('remove', function(next) {
  Book.find({ author: this.id }, (err, books) => {
    // if mongoose cant connect to db
    if (err) {
      next(err)
    } else if (books.length > 0) {
      next(new Error('This author has books still'))
    // if no book is linked to the author
    } else {
      next()
    }
  })
})

//export authorSchema as "Author";
module.exports = mongoose.model("Author", authorSchema);
