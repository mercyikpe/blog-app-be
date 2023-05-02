const { successResponse } = require("../helpers/requestHandler");
const createError = require("http-errors");
const PostModel = require("../models/post");
const { default: mongoose } = require("mongoose");

// @desc  Get all posts
// GET -> isLoggedIn -> /api/blogs
const getAllPosts = async (req, res, next) => {
  try {
    const allPosts = await PostModel.find();
    return successResponse(res, {
      statusCode: 200,
      message: `returns all blogs`,
      payload: allPosts,
    });
  } catch (error) {
    next(error);
  }
};


// @desc  Create new post
// POST -> isLoggedIn -> /api/users/new
const createPost = async (req, res, next) => {
  try {
    const { postTitle, postBody } = req.body;

    if (!postTitle || !postBody) {
      throw createError(400, "Title and description are required");
    }

    if (postTitle.length < 3) {
      throw createError(400, "Title should be at least 3 characters long");
    }

    if (postBody.length < 3) {
      throw createError(
        400,
        "Post description should be at least 3 characters long"
      );
    }


    const postImage = req.file && req.file.path;

    if (postImage && postImage.size > 1024 * 1024 * 2) {
      throw createError(
        400,
        "Image size is too large. It must be less than 2mb."
      );
    }

    // create new blog
    const newPost = await PostModel.create({
      postTitle,
      postBody,
      postImage,
      user: req.body.id
    });


     // step 6: send the response
     if (!newPost) throw createError(400, "Post was not created");

    return successResponse(res, {
      statusCode: 201,
      message: `Post created successfully`,
      payload: newPost,
    });
  } catch (error) {
    next(error);
  }
};


// @desc  Update post by id
// PUT -> isLoggedIn -> /api/blogs/:id
const handleUpdatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let updates = {};
    if (req.body.postTitle) {
      updates.postTitle = req.body.postTitle;
    }
    if (req.body.postBody) {
      updates.postBody = req.body.postBody;
    }
    const postImage = req.file;
    if (postImage) {
      if (postImage.size > Math.pow(1024, 2))
        throw createError(
          400,
          "File too large. It must be less than 1 mb in size"
        );
      updates.postImage = image.path;
    }

    // Update the post in the database
    const updateOptions = { new: true };
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      updates,
      updateOptions
    );

    if (!updatedPost) {
      throw createError(404, "Post not found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: `Post updated successfully`,
      payload: updatedPost,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, "Invalid post id"));
      return;
    }
    next(error);
  }
};

// @desc  Delete post by id
// DELETE -> isLoggedIn -> /api/blogs/:id
const handleDeletePost = async (req, res, next) => {
  try {
    // const id = req.params.id;

    const post = await PostModel.findOneAndDelete(req.params.id);
    if (!post) {
      throw createError(400, "Post not found");
    }
    // await post.remove()

    return successResponse(res, {
      statusCode: 200,
      message: "Post was deleted successfully",
      payload: { id: req.params.id}
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, "Invalid post id"));
    }
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  handleUpdatePost,
  handleDeletePost,
};
