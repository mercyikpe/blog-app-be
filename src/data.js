const bcrypt = require("bcrypt");
const data = {
  users: [
    {
      name: "test 1",
      email: "test@gmail.com",
      password: bcrypt.hashSync("123456", 10),
    },
    {
      name: "test 2",
      email: "test2@gmail.com",
      password: bcrypt.hashSync("123456", 10),
    },
    {
      name: "test 3",
      email: "test3@gmail.com",
      password: bcrypt.hashSync("123456", 10),
    },
  ],
};

module.exports = data;