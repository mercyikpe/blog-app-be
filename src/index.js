// please change everything based on your need
const express = require('express');
const createError = require("http-errors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const connectDB = require("./config/db");
const dev = require("./config");
const {successResponse} = require("./helpers/requestHandler");
const userRouter = require("./routes/user");
const postRouter = require("./routes/posts");


const app = express();
const port = dev.app.serverPort;

app.listen(port, async () => {
  console.log(`Server listening on http://localhost:${port}`);
  await connectDB();
});

// route health check
app.get("/test-api", (req, res) => {
  successResponse(res, 200, "Server is running fine", {})
});

app.use(
    cors({
      origin: '*'
    })
);
app.use(cookieParser());
app.use("/public", express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/blogs", postRouter);

// handle 404 errors
app.use((req, res, next) => {
  next(createError(404, "Route not found, try /api/blogs to see all posts"));
});

// handle 500 errors
app.use((err, req, res, next) => {
  const statusCode = err.status;
  res.status(statusCode || 500).json({
    error: {
      statusCode: statusCode || 500,
      message: err.message,
    },
  });
});