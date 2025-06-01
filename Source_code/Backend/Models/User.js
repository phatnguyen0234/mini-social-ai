const mongoose = require("mongoose");
const { isEmail } = require("validator");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
   // _id: {
     // type: String,    // Auto-generated so changed to string
   // },
    createdAt: {
      type: Date,
      default: Date.now
    },
    username: {
      type: String,
      required: [true, "Required"],
      minlength: [6, "Must be at least 6 characters"],
      maxlength: [20, "Must be less than 20 characters"],
      unique: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    displayName: {
      type: String,
      default: "New User",
    },
    about: {
      type: String,
      default: "I'm a new user",
    },    age: {
      type: Number,
      default: function() {
        // Calculate years since account creation
        const now = new Date();
        const created = this._id.getTimestamp();
        return Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365));
      }
    },
    email: {
      type: String,
      required: [true, "Required"],
      maxlength: [50, "Must be 50 characters or less"],
      unique: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Required"],
      select: false,
      minlength: [8, "Must be 8 characters or more"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://preview.redd.it/rrz3hmsxcll71.png?width=640&crop=smart&auto=webp&s=87cc5ed38d8f088ef9fffef7a4c5756b64309d6a",
    },
    theme: {
      type: String,
      default: "#ff9051",
    },
    karmas: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    favorites: {
      type: Array,
      default: [],
    },
    isBot: { type: Boolean, default: false },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique",
});

module.exports = mongoose.model("User", userSchema);