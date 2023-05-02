const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const dev = require("../config");
const UserModel = require("../models/user");


const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, dev.app.jwtSecret);
      // get user from the token
      req.user = await UserModel.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      next(createError(401, "Not authorised, invalid token"));
    }
  }

  if (!token) {
    next(createError(401, "Not authorised, no token"));
  }
};

 const isLoggedIn = (req, res, next) => {
    try {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const accessToken = getAccessTokenFromCookies(cookieHeader);
        if (!accessToken) {
          throw createError(401, 'Access token not found');
        }
        // verify login token
        const decoded = jwt.verify(accessToken, String(dev.app.jwtAcessTokenKey));
        // add id to request
        req.body.id = decoded._id;
        next();
      } else {
        throw createError(404, 'Cookies not found. Please login');
      }
    } catch (error) {
      return next(error);
    }
  };


  module.exports = {protect, isLoggedIn}