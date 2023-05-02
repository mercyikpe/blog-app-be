const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    postTitle: {
      type: String,
      trim: true,
      required: [true, "Blog Title is required"],
    },
    postBody: {
      type: String,
      trim: true,
      required: [true, "Blog text is required"],
    },
    postImage: {
      type: String,
      // required: [true, "Blog image is required"],
    },
  },
  { timestamps: true }
);

// create the model
const PostModel = model("blogs", postSchema);
module.exports = PostModel;
