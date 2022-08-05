//import
const mongoose = require("mongoose");
const coverImageBasePath = 'uploads/bookCovers'
const path = require('path')

// schema = table
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
  },
  publish_date: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  coverImageName: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
});

bookSchema.virtual('coverImagePath').get(function() {
  if (this.coverImageName != null) {
    return path.join('/',coverImageBasePath,this.coverImageName)
  }
})


//export bookSchema as "Book";
module.exports = mongoose.model("Book", bookSchema);
module.exports.coverImageBasePath = coverImageBasePath
