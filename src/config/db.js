const mongoose = require("mongoose");
const chalk = require("chalk");

const dev = require(".");

const connectDB = async () => {
  try {
    mongoose.connect(dev.db.mongodbUrl);

    mongoose.connection.on("connected", () => {
      console.log(chalk.bgGreenBright("Connected to database successfully"));
    });

    mongoose.connection.on("error", (err) => {
      console.log(chalk.bgRedBright("Error while connecting to database :" + err));
    });

    mongoose.connection.on("disconnected", () => {
      console.log(chalk.bgYellow("Mongodb connection disconnected"));
    });

  } catch (err) {
    console.log(chalk.bgRed(error.message));
  }
};

module.exports = connectDB;
