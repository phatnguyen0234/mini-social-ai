const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter config
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Allows self-signed certificates
  }
});

const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      // Validate input
      if (!req.body.email || !req.body.username || !req.body.password) {
        return res.status(400).json({
          message: "Email, username and password are required"
        });
      }

      // Validate password length
      if (req.body.password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters"
        });
      }

      // Check if username already exists
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Save user to database
      const savedUser = await newUser.save();
      
      // Return success without password
      const { password, ...userWithoutPassword } = savedUser._doc;
      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword
      });

    } catch (err) {
      // Handle mongoose validation errors
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
          message: messages[0]
        });
      }

      // Handle other errors
      console.error("Register error:", err);
      res.status(500).json({
        message: "An error occurred during registration"
      });
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY,
      { expiresIn: "365d" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },
  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select(
        "+password"
      );
      if (!user) {
        return res.status(404).json({message:"Email not found"});
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json({message:"Incorrect password"});
      } else if (user && validPassword) {
        //Generate access token
        const accessToken = authController.generateAccessToken(user);
        //Generate refresh token
        const refreshToken = authController.generateRefreshToken(user);
        //STORE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "none",
        });
        const returnedUser = {
          ...user._doc,
          accessToken: accessToken,
        };
        res.status(200).json(returnedUser);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  requestRefreshToken: async (req, res) => {
    //Take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    //Send error if token is not valid
    if (!refreshToken) return res.status(401).json("You're not authenticated");

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      //create new access token, refresh token and send to user
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  },

  //LOG OUT
  logOut: async (req, res) => {
    //Clear cookies when user logs out
    res.clearCookie("refreshToken");
    res.status(200).json("Logged out successfully!");
  },

  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email address is required"
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address"
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = await bcrypt.hash(resetToken, 10);

      // Save reset token to user
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Create reset password URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      // Setup email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h1>You have requested a password reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Password reset email has been sent successfully"
      });    } catch (err) {
      console.error("Password reset request error:", err);
      let errorMessage = "Error sending password reset email. Please try again later.";
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = "Could not connect to email server. Please check server configuration.";
      } else if (err.code === 'EAUTH') {
        errorMessage = "Email authentication failed. Please check email credentials.";
      } else if (err.responseCode === 535) {
        errorMessage = "Invalid email credentials. Please check email settings.";
      }
      
      res.status(500).json({
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Reset password with token
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          message: "New password is required"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long"
        });
      }

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: { $exists: true },
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          message: "Password reset token is invalid or has expired"
        });
      }

      // Verify token
      const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
      if (!isValidToken) {
        return res.status(400).json({
          message: "Invalid reset token"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({
        message: "Password has been reset successfully"
      });

    } catch (err) {
      console.error("Password reset error:", err);
      res.status(500).json({
        message: "Error resetting password. Please try again later."
      });
    }
  },
};

module.exports = authController;