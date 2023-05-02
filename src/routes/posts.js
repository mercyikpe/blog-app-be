const postRouter = require('express').Router();

const { createPost, getAllPosts, handleUpdatePost, handleDeletePost } = require('../controllers/posts');
const upload = require("../middlewares/uploadFile");
const { protect } = require("../middlewares/auth")

postRouter.route("/")
.get(getAllPosts)
.post(upload.single("postImage"), createPost);

postRouter.route('/:id',) 
.put( upload.single('postImage'), handleUpdatePost)
.delete( handleDeletePost);


module.exports = postRouter;