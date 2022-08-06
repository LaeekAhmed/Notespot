//import
const mongoose = require("mongoose");

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
  coverImage: {
    type: Buffer,
    required: true
  },
  coverImageType: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
});

bookSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage != null && this.coverImageType != null) {
    let val = `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString("base64")}`
    console.log('data len : ',val.length)
    return val
  }
})


//export bookSchema as "Book";
module.exports = mongoose.model("Book", bookSchema);
