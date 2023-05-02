require('dotenv').config()

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 8081,
    jwtActivationSecretKey: process.env.JWT_ACTIVATION_KEY,
    clientUrl: process.env.CLIENT_URL,
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    jwtSecret: process.env.JWT_SECTRET,
  },
  db: {
    mongodbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017",
  },
};

module.exports = dev;
