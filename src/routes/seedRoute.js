const seedRouter = require("express").Router();
const data = require("../data");
const UserModel = require("../models/user");

seedRouter.get("/", async (req, res) => {
  // res.send(data)
  await UserModel.deleteMany();

  const users = UserModel.insertMany(data.users);

  return res.json({
    statusCode: "201",
    message: "User created successfully",
    payload: users,
  });
});

module.exports = seedRouter;
