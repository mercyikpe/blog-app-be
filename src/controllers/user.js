const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const UserModel = require("../models/user");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/sendEmail");
const { successResponse, errorResponse } = require("../helpers/requestHandler");

// @desc  Register user
// @route POST /api/users/ 
// @access Public
const registerUser = async (req, res, next) => {
  try {
    // step 1: get the user data from the form
    const { name, email, password } = req.body;

    const profilePicture = req.file && req.file.path;

    // check that form fields are not empty
    if (!name || !email || !password) {
      throw createError(404, "name, email or password is missing");
    }

    // check password length
    if (password.length < 6) {
      throw createError(400, "min length for password is 6 characters");
    }

    // check image size
    if (profilePicture && profilePicture.size > Math.pow(1024, 1024))
      throw createError(
        400,
        "Image size is too big. It must be less than 1Mb."
      );

    // check if user exists
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      throw createError(409, "User already exist with this email");
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create token for storing the data temporarily
    const token = jwt.sign(
      {
        ...req.body,
        password: hashedPassword,
        profilePicture: profilePicture,
      },
      String(dev.app.jwtActivationSecretKey),
      { expiresIn: "10m" }
    );

    // send verification mail with defined transport object
    const emailData = {
      email,
      subject: "Account Activation",
      html: `
                <h2>Good Morning ${name}</h2>
                <p>Please click <a href="${dev.app.clientUrl}/activate/${token}" target="_blank"> here </a>to activate your account</p>
                <p>
                <b>Mercy Ikpe. <br>
                    <em>FullStack Dev</em>
                </b>  
                </p>`, // html body
    };

    await sendEmailWithNodeMailer(emailData);

    return successResponse(res, {
      statusCode: 200,
      message: `A verification link has been sent to your email: ${email} for completeting your registration process`,
      payload: token,
    });
  } catch (error) {
    // if it is viloating the schema error
    if (error.name === "validationError") {
      next(createError(422, error.message));
      return;
    }
    return next(error);
  }
};

// @desc  Verify user
// @route POST /api/users/activate
const verifyEmail = async (req, res, next) => {
  try {
    // step 1: get token from request body
    const token = req.body.token;

    // step 2: check token exist in request body
    if (!token) throw createError(404, "token not found");

    // step 3: verify token and decode data
    const decoded = jwt.verify(token, String(dev.app.jwtActivationSecretKey));

    // check if email is already verified
    const existingUser = await UserModel.findOne({ email: decoded.email });
    if (existingUser) throw createError(400, "This email is already activated");

    // step 4: create the user
    const newUser = new UserModel({ ...decoded });

    // step 5: save the user
    const user = await newUser.save();

    if (!user) throw createError(400, "Account not activated");

    // step 6: send the response
    return successResponse(res, {
      statusCode: 201,
      message: "Account activated successfully",
      payload: {token: generateToken(user._id)},
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check that form fields are not empty
    if (!email || !password) {
      throw createError(404, "Email or password is missing");
    }

    // check for user email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createError(
        400,
        "User with this email does not exist. Please register"
      );
    }

    if (user.isBanned) {
      throw createError(403, "You are banned. Please contact the authority");
    }

    // check that given password matches the hashes password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw createError(400, "Invalid login credentials");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User signed in",
      payload: {user, token: generateToken(user._id)},
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user data
// POST -> isLoggedIn -> /api/users/me
const userProfile = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: "User details",
      payload: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout User
// POST -> isLoggedIn -> /api/users/logout
const logoutUser = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: "user was logged out",
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Send Email for forget password
// POST -> isLoggedIn -> /api/users/forget-password
const forgetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(404, "email or password is missing");
    }

    if (password.length < 6) {
      throw createError(400, "minimum length for password is 6");
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      throw createError(400, "user was not found with this email address");
    }

    // hash the password before sending the token
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create token for storing the data temporarily
    const token = jwt.sign(
      {
        email,
        hashedPassword,
      },
      dev.app.jwtActivationSecretKey,
      { expiresIn: "1m" }
    );

    // send verification mail with defined transport object
    const emailData = {
      email,
      subject: "Reset Password",
      html: `
                <h2>Hello ${user.name}</h2>
                <p>Please click <a href="${dev.app.clientUrl}/reset-password/${token}" target="_blank"> here </a>to reset your password.</p>
                <p>
                <b>Mercy Ikpe. <br>
                    <em>FullStack Dev</em>
                </b>  
                </p>`, // html body
    };

    await sendEmailWithNodeMailer(emailData);

    return successResponse(res, {
      statusCode: 200,
      message: `A Reset password link has been sent to your email: ${email} for completeting your reset password process`,
      payload: token,
    });
  } catch (error) {
    // if it is viloating the schema error
    if (error.name === "validationError") {
      next(createError(422, error.message));
      return;
    }
    return next(error);
  }
};

// @desc  Allow user reset password
// POST -> isLoggedIn -> /api/users/reset-password
const resetPassword = async (req, res, next) => {
  try {
    // step 1: get token from request body
    const token = req.body.token;

    // step 2: check token exist in request body
    if (!token) {
      throw createError(404, "Token is missing");
    }

    // step 3: verify token and decode data
    jwt.verify(
      token,
      dev.app.jwtActivationSecretKey,
      async function (err, decoded) {
        if (err) {
          return errorResponse(res, 400, "Token has expired");
          //  throw createError(400, "Token is expired");
        }
        // destructure the data from decoded
        const { email, hashedPassword } = decoded;

        // check if email exist
        const existingUser = await UserModel.findOne({ email: decoded.email });
        if (!existingUser)
          throw createError(400, "User with this email does not exist");

        // update the user data
        const updateData = await UserModel.updateOne(
          { email },
          {
            $set: {
              password: hashedPassword,
            },
          }
        );
        if (!updateData) {
          throw createError(400, "Password not reset");
        }
        // step 6: send the response
        return successResponse(res, {
          statusCode: 201,
          message: "Password reset successful. Ready to login in",
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, dev.app.jwtSecret, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  userProfile,
  logoutUser,
  forgetPassword,
  resetPassword,
};
