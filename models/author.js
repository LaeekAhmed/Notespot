const mongoose = require("mongoose");

// schema = table
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

//export authorSchema as "Author";
module.exports = mongoose.model("Author", authorSchema);
